import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { highlightActiveLineGutter, lineNumbers } from '@codemirror/gutter';
import { HighlightStyle, tags } from '@codemirror/highlight';
import { history, historyKeymap } from '@codemirror/history';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { indentOnInput } from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { bracketMatching } from '@codemirror/matchbrackets';
import { EditorSelection, EditorState, StateCommand, Text, Transaction } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../modules';
import { change, initialize, setEditorView } from '../modules/editor';

const insertHeadFirst: StateCommand = ({ state, dispatch }) => {
  console.log(state);
};

const insertBoldMarker: StateCommand = ({ state, dispatch }) => {
  const changes = state.changeByRange((range) => {
    const isBoldBefore = state.sliceDoc(range.from - 2, range.from) === '**';
    const isBoldAfter = state.sliceDoc(range.to, range.to + 2) === '**';
    const changes = [];

    changes.push(
      isBoldBefore
        ? {
            from: range.from - 2,
            to: range.from,
            insert: Text.of(['']),
          }
        : {
            from: range.from,
            insert: Text.of(['**']),
          },
    );

    changes.push(
      isBoldAfter
        ? {
            from: range.to,
            to: range.to + 2,
            insert: Text.of(['']),
          }
        : {
            from: range.to,
            insert: Text.of(['**']),
          },
    );

    const extendBefore = isBoldBefore ? -2 : 2;
    const extendAfter = isBoldAfter ? -2 : 2;

    return {
      changes,
      range: EditorSelection.range(range.from + extendBefore, range.to + extendAfter),
    };
  });

  dispatch(
    state.update(changes, {
      scrollIntoView: true,
      annotations: Transaction.userEvent.of('input'),
    }),
  );

  return true;
};

const syntaxHighlighting = HighlightStyle.define([
  {
    tag: tags.heading1,
    fontSize: '1.6em',
    fontWeight: 'bold',
  },
  {
    tag: tags.heading2,
    fontSize: '1.4em',
    fontWeight: 'bold',
  },
  {
    tag: tags.heading3,
    fontSize: '1.2em',
    fontWeight: 'bold',
  },
]);

interface HandleDocChange {
  (doc: string): void;
}

const customKeyMap = defaultKeymap.filter(({ key }) => key !== 'Mod-i');

const createEditorState = (doc: string, handleDocChange: HandleDocChange) => {
  return EditorState.create({
    doc,
    extensions: [
      keymap.of([
        {
          key: 'Ctrl-i',
          run: insertBoldMarker,
        },
        {
          key: 'Ctrl-1',
          run: insertHeadFirst,
          preventDefault: true,
        },
        ...historyKeymap,
        ...customKeyMap,
        indentWithTab,
      ]),
      history(),
      highlightActiveLineGutter(),
      indentOnInput(),
      lineNumbers(),
      bracketMatching(),
      syntaxHighlighting,
      markdown({
        base: markdownLanguage,
        codeLanguages: languages,
        addKeymap: true,
      }),
      EditorView.updateListener.of((update) => {
        if (update.changes) {
          handleDocChange(update.state.doc.toString());
        }
      }),
    ],
  });
};

const useCodeMirror = () => {
  const initialized = useSelector((state: RootState) => state.editor.initialized);
  const dispatch = useDispatch();
  const refContainer = useRef<HTMLDivElement>(null);

  const handleDocChange = useCallback((doc: string) => {
    dispatch(change(doc));
  }, []);

  useEffect(() => {
    console.log(refContainer.current, initialized);
    if (!refContainer.current || initialized) return;

    const state = createEditorState('', handleDocChange);

    const view = new EditorView({
      state,
      parent: refContainer.current,
    });

    dispatch(initialize());
    dispatch(setEditorView(view));
    console.log(view);
  }, [refContainer]);

  return refContainer;
};

export default useCodeMirror;
