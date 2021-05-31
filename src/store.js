import { combineReducers, createStore } from 'redux';
import userReducer from './reducers/userReducer';
import taskReducer from './reducers/taskReducer';
import bidReducer from './reducers/bidReducer';
import infoReducer from './reducers/infoReducer'

const reducers = combineReducers({
	user: userReducer,
	tasks: taskReducer,
	bids: bidReducer,
	info: infoReducer
});

const store = createStore(reducers);

export default store;
