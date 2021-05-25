const initialState = {
	bids: []
};

const bidReducer = (state = initialState, action) => {
	switch (action.type) {
		case 'GET_BIDS':
			return {
				...state,
				bids: action.bids
			};
		case 'CLEAR_BIDS':
			return {
				...state,
				bids: []
			};
		default:
			return state;
	}
};

export const GetBidsActionCreator = (bids) => ({
	type: 'GET_BIDS',
	bids: bids
});

export const ClearBidsActionCreator = () => ({ type: 'CLEAR_BIDS' });

export default bidReducer;
