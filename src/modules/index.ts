import { combineReducers } from 'redux';
import editor from './editor';

const rootReducer = combineReducers({
  editor,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
