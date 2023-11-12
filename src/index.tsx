import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App/App";
import "primereact/resources/themes/lara-light-indigo/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import { store } from './Store/store'
import { Provider } from 'react-redux'

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <Provider store={store}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>
);
