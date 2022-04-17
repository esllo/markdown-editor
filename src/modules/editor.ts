import { EditorView } from '@codemirror/view';

const CHANGE = 'editor/DOCUMENT_CHANGE' as const;
const SET_EDITOR_VIEW = 'editor/SET_EDITOR_VIEW' as const;
const INITIALIZE = 'editor/INITIALIZE' as const;

export const change = (doc: string) => ({
  type: CHANGE,
  payload: doc,
});

export const setEditorView = (editor: EditorView) => ({
  type: SET_EDITOR_VIEW,
  payload: editor,
});

export const initialize = () => ({
  type: INITIALIZE,
});

type EditorAction =
  | ReturnType<typeof change>
  | ReturnType<typeof setEditorView>
  | ReturnType<typeof initialize>;

interface EditorState {
  doc: string;
  editor: Nullable<EditorView>;
  initialized: boolean;
}

const initialState: EditorState = {
  doc: '',
  editor: null,
  initialized: false,
};

const editor = (state: EditorState = initialState, action: EditorAction): EditorState => {
  switch (action.type) {
    case CHANGE:
      return {
        ...state,
        doc: action.payload,
      };
    case SET_EDITOR_VIEW:
      return {
        ...state,
        editor: action.payload,
      };
    case INITIALIZE:
      return {
        ...state,
        initialized: true,
      };
    default:
      return state;
  }
};

export default editor;
