import { combineReducers, createStore } from 'redux';
import userReducer from './reducers/userReducer';
import taskReducer from './reducers/taskReducer';
import bidReducer from './reducers/bidReducer';

const reducers = combineReducers({
	user: userReducer,
	tasks: taskReducer,
	bids: bidReducer
});

const store = createStore(reducers);

export default store;
