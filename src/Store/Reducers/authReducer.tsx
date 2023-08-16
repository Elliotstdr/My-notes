const INITIAL_STATE: AuthState = {
  userId: null,
  token: null,
  isConnected: false,
  header: null,
};

const authReducer = (state = INITIAL_STATE, action: any): AuthState => {
  if (action.type === "UPDATE_AUTH") {
    return {
      ...state,
      ...action.value,
    };
  }
  return state;
};

export default authReducer;
