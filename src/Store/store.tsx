import { combineReducers, legacy_createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import dataReducer from "./Reducers/dataReducer";
import authReducer from "./Reducers/authReducer";

export interface RootState {
  data: DataState,
  auth: AuthState
}

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["data", "auth"],
};

const rootReducer = combineReducers<RootState>({
  data: dataReducer,
  auth: authReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = legacy_createStore(persistedReducer, composeWithDevTools());
export const persistor = persistStore(store);

