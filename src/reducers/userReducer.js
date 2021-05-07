const initialState = {
  money: 0,
  lvl: 0,
  output: 0,
  mail: "",
  referrer: "",
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case "GET_USER_DATA":
      return {
        ...state,
        mail: action.mail,
        all_money: action.all_money,
        allow_money: action.allow_money,
        clicks: action.clicks,
        date: action.date,
        lvl: action.lvl,
        purchases: action.purchases,
        refs: action.refs,
      };
    default:
      return state;
  }
};

export const GetUserDataActionCreator = (
  mail,
  all_money,
  allow_money,
  clicks,
  date,
  lvl,
  purchases,
  refs
) => ({
  type: "GET_USER_DATA",
  mail: mail,
  all_money: all_money,
  allow_money: allow_money,
  clicks: clicks,
  date: date,
  lvl: lvl,
  purchases: purchases,
  refs: refs,
});

export default userReducer;
