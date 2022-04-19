import styled from '@emotion/styled';
import useCodeMirror from '../hooks/useCodeMirror';
import useShortcutLock from '../hooks/useShortcutLock';

const EditorDiv = styled.div`
  flex: 0 0 50%;
  border-right: 1px solid #ccc;
  box-sizing: border-box;
`;

const Editor = () => {
  const refContainer = useCodeMirror();
  useShortcutLock();

  return <EditorDiv className="editor-wrap" ref={refContainer} />;
};

export default Editor;
