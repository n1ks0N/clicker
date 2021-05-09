const initialState = {
  data: {},
  mail: ''
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case "GET_USER_DATA":
      return {
        ...state,
        data: action.data,
        mail: action.mail
      };
    case 'GET_REFERRER':
      return {
        ...state,
        activeReferrer: action.activeReferrer
      }
    default:
      return state;
  }
};

export const GetUserDataActionCreator = (
  data,
  mail
) => ({
  type: "GET_USER_DATA",
  data: data,
  mail: mail
});

export const GetReferrerActionCreator = (activeReferrer) => ({ type: 'GET_REFERRER', activeReferrer: activeReferrer })

export default userReducer;
