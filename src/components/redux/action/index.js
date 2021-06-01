import { 
    SET_USER_DETAILS,
} from "../constants/actionType";

export function setUserDetails(payload) {
    return { type: SET_USER_DETAILS, payload:payload }
}
