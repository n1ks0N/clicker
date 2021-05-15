import { combineReducers, createStore } from "redux";
import userReducer from "./reducers/userReducer";
import taskReducer from './reducers/taskReducer'

const reducers = combineReducers({
  user: userReducer,
  tasks: taskReducer
});

const store = createStore(reducers);

export default store;
