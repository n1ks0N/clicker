const initialState = {
	data: {},
	mail: '',
	alert: false
};

const userReducer = (state = initialState, action) => {
	switch (action.type) {
		case 'GET_USER_DATA':
			return {
				...state,
				data: action.data,
				mail: action.mail
			};
		case 'GET_REFERRER':
			return {
				...state,
				activeReferrer: action.activeReferrer
			};
		case 'UPDATE_USER_DATA':
			return {
				...state,
				data: {
					...state.data,
					[action.name]: action.param
				}
			};
		case 'UPDATE_ALERT':
			return {
				...state,
				alert: action.alert
			}
		default:
			return state;
	}
};

export const GetUserDataActionCreator = (data, mail) => ({
	type: 'GET_USER_DATA',
	data: data,
	mail: mail
});

export const GetReferrerActionCreator = (activeReferrer) => ({
	type: 'GET_REFERRER',
	activeReferrer: activeReferrer
});

export const UpdateUserDataActionCreator = (name, param) => ({
	type: 'UPDATE_USER_DATA',
	name: name,
	param: param
});

export const UpdateAlertActionCreator = (alert) => ({ type: 'UPDATE_ALERT', alert: alert })

export default userReducer;
