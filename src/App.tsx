import { useSelector } from 'react-redux';
import Editor from './components/Editor';
import Preview from './components/Preview';
import { RootState } from './modules';
import './App.css';
import SplitView from './components/SplitView';

const App = () => {
  const doc = useSelector((state: RootState) => state.editor.doc);
  return (
    <div className="app">
      <SplitView>
        <Editor />
        <Preview doc={doc} />
      </SplitView>
    </div>
  );
};

export default App;
