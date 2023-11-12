const INITIAL_STATE: DataState = {
  pages: null,
  sheets: null,
  notes: null,
  toast: null,
  selectedNode: {},
  expandedKeys: {}
};

const dataReducer = (state = INITIAL_STATE, action: any): DataState => {
  if (action.type === "UPDATE_DATA") {
    return {
      ...state,
      ...action.value,
    };
  }
  return state;
};

export default dataReducer;
