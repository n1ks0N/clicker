const initialState = {
  allData: {},
	info: {}
};

const infoReducer = (state = initialState, action) => {
	switch (action.type) {
    case 'GET_INFO':
      return {
        ...state,
        allData: action.info,
        info: action.info.info
      }
		default:
			return state;
	}
};

export const GetInfoActionCreator = (info) => ({ type: 'GET_INFO', info: info })

export default infoReducer;
