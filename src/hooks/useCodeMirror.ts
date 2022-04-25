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
import download from '../lib/download';
import { RootState } from '../modules';
import { change, initialize, setEditorView } from '../modules/editor';

function getHeading(line: string) {
  const headings = ['###### ', '##### ', '#### ', '### ', '## ', '# '];
  for (const heading of headings) {
    if (line.startsWith(heading)) {
      return heading;
    }
  }
  return '';
}

function insertHeading(headingText: string): StateCommand {
  return ({ state, dispatch }) => {
    const changes = state.changeByRange((range) => {
      let lineStart = 0;
      const { text }: any = state.doc;
      let line = '';
      for (let i = 0; i < text.length; i++) {
        line = text[i];
        let lineEnd = lineStart + line.length + 1;
        if (lineStart <= range.from && range.to < lineEnd) {
          break;
        }
        lineStart = lineEnd;
      }
      const changes = [];
      const heading = getHeading(line);
      if (!heading || heading !== headingText) {
        // add heading
        changes.push({
          from: lineStart,
          to: lineStart + heading.length,
          insert: Text.of([headingText]),
        });
        return {
          changes,
          range: EditorSelection.range(lineStart + headingText.length, lineStart + headingText.length),
        };
      }
      // remove heading
      changes.push({
        from: lineStart,
        to: lineStart + headingText.length,
        insert: Text.of(['']),
      });

      return {
        changes,
        range: EditorSelection.range(lineStart, lineStart),
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
}

function insertMarker(marker: string, enter: boolean = false): StateCommand {
  return ({ state, dispatch }) => {
    const changes = state.changeByRange((range) => {
      const markerLength = marker.length;
      let isMarkerBefore = state.sliceDoc(range.from - markerLength, range.from) === marker;
      let isMarkerAfter = state.sliceDoc(range.to, range.to + markerLength) === marker;
      const changes = [];

      if ((isMarkerBefore && !isMarkerAfter) || (!isMarkerBefore && isMarkerAfter)) {
        isMarkerAfter = false;
        isMarkerBefore = false;
      }

      const isAdditional = !isMarkerBefore && !isMarkerAfter && enter;

      const beforeMarkers = [marker];
      const afterMarkers = [marker];

      let additional = 3;
      if (isAdditional) {
        changes.push({
          from: range.to,
          to: range.to,
          insert: Text.of(['']),
        });
        const beforeText = state.sliceDoc(range.from - 1, range.to);
        if (beforeText !== '' && beforeText !== '\n') {
          beforeMarkers.unshift('');
          additional++;
        }
        beforeMarkers.push('');
        if (state.sliceDoc(range.from, range.to).length > 0) {
          afterMarkers.unshift('');
        }
        afterMarkers.push('');
      }

      changes.push(
        isMarkerBefore
          ? {
              from: range.from - markerLength,
              to: range.from,
              insert: Text.of(['']),
            }
          : {
              from: range.from,
              insert: Text.of(beforeMarkers),
            },
      );

      changes.push(
        isMarkerAfter
          ? {
              from: range.to,
              to: range.to + markerLength,
              insert: Text.of(['']),
            }
          : {
              from: range.to,
              insert: Text.of(afterMarkers),
            },
      );

      const extendBefore = isMarkerBefore ? -markerLength : markerLength;
      const extendAfter = isMarkerAfter ? -markerLength : markerLength;

      if (isAdditional) {
        return {
          changes,
          range: EditorSelection.range(range.from + additional, range.from + additional),
        };
      }

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
}

const downloadMarkdown: StateCommand = ({ state }) => {
  download('markdown.md', state.doc.toString());
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
  {
    tag: tags.strong,
    fontWeight: 'bold',
  },
  {
    tag: tags.emphasis,
    fontStyle: 'italic',
  },
  {
    tag: tags.strikethrough,
    textDecoration: 'line-through',
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
          key: 'Ctrl-b',
          run: insertMarker('**'),
        },
        {
          key: 'Ctrl-i',
          run: insertMarker('*'),
        },
        {
          key: 'Ctrl-d',
          run: insertMarker('~~'),
        },
        {
          key: 'Ctrl-`',
          run: insertMarker('`'),
          preventDefault: true,
        },
        {
          key: 'Ctrl-Shift-`',
          run: insertMarker('```', true),
          preventDefault: true,
        },
        {
          key: 'Ctrl-1',
          run: insertHeading('# '),
          preventDefault: true,
        },
        {
          key: 'Ctrl-2',
          run: insertHeading('## '),
          preventDefault: true,
        },
        {
          key: 'Ctrl-3',
          run: insertHeading('### '),
          preventDefault: true,
        },
        {
          key: 'Ctrl-4',
          run: insertHeading('#### '),
          preventDefault: true,
        },
        {
          key: 'Ctrl-5',
          run: insertHeading('##### '),
          preventDefault: true,
        },
        {
          key: 'Ctrl-6',
          run: insertHeading('###### '),
          preventDefault: true,
        },
        {
          key: 'Ctrl-s',
          run: downloadMarkdown,
          preventDefault: true,
        },
        ...historyKeymap,
        ...customKeyMap,
        indentWithTab,
      ]),
      history(),
      highlightActiveLineGutter(),
      indentOnInput(),
      // lineNumbers(),
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
      EditorView.theme({
        '.cm-content': {
          fontFamily:
            "Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif",
        },
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
