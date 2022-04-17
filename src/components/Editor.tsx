import styled from '@emotion/styled';
import useCodeMirror from '../hooks/useCodeMirror';

const EditorDiv = styled.div`
  flex: 0 0 50%;
`;

const Editor = () => {
  const refContainer = useCodeMirror();

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).className.includes('editor-wrap')) {
      (document.getElementsByClassName('cm-content')[0] as HTMLElement)?.focus();
    }
  };

  return <EditorDiv className="editor-wrap" onClick={handleEditorClick} ref={refContainer} />;
};

export default Editor;
