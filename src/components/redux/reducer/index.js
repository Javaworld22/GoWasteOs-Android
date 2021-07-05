import {
  SET_USER_DETAILS,
} from "../constants/actionType";

const initialState = {
  userDetails: []
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER_DETAILS:
        return {...state, userDetails: action.payload };
      break;

    default:
      break;
  }
  return state;
}

export default rootReducer;
