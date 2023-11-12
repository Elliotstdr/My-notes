import React, { useEffect, useRef } from 'react';
import './App.scss';
import NavBar from '../Components/NavBar/NavBar';
import { useFetchGet } from '../Services/api';
import SheetInterface from '../Components/SheetInterface/SheetInterface';
import { useSelector, useDispatch } from "react-redux";
import Loader from '../Utils/Loader/loader';
import { Toast } from "primereact/toast";
import Login from '../Components/Login/Login';

const App = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const data = useSelector((state: RootState) => state.data);
  const dispatch = useDispatch();
  const updateData = (value: Partial<DataState>) => { dispatch({ type: "UPDATE_DATA", value }) };
  const updateAuth = (value: Partial<AuthState>) => { dispatch({ type: "UPDATE_AUTH", value }) };
  const toast = useRef(null);
  const interval = useRef<NodeJS.Timer>();
  const pageData = useFetchGet("/page", auth.token)
  const sheetData = useFetchGet("/sheet", auth.token)
  const noteData = useFetchGet("/note", auth.token)

  useEffect(() => {
    if (auth.isConnected) {
      checkToken();
    }
    updateData({
      toast: toast,
    })
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (auth.isConnected) {
      interval.current = setInterval(() => {
        checkToken()
      }, 60 * 1000);
    } else {
      clearInterval(interval.current);
      interval.current = undefined;
    }
    return () => {
      clearInterval(interval.current);
      interval.current = undefined;
    }; // Stoppe l'écoute si quitte la page

    // eslint-disable-next-line
  }, [auth.isConnected, auth.token]);

  useEffect(() => {
    if (pageData.loaded && sheetData.loaded && noteData.loaded) {
      updateData({
        pages: pageData.data,
        sheets: sheetData.data,
        notes: noteData.data,
        selectedNode: Object.keys(data.selectedNode).length === 0
          ? { children: true }
          : data.selectedNode
      })
    }
    // eslint-disable-next-line
  }, [pageData.loaded, sheetData.loaded, noteData.loaded])

  const checkToken = () => {
    const decodedPayload = auth.token ? atob(auth.token.split(".")[1]) : "";
    const payloadObject = JSON.parse(decodedPayload);
    if (payloadObject.exp * 1000 - new Date().getTime() < 0) {
      window.location.href = "/";
      updateAuth({
        userId: null,
        token: null,
        isConnected: false,
      });
    }
  }

  return (
    <div className="App">
      <Toast ref={toast}></Toast>
      {
        auth.isConnected ?
          data.pages && data.notes &&
            data.sheets && Object.keys(data.selectedNode).length !== 0 ?
            <>
              <NavBar />
              <div className="App__main">
                {!data.selectedNode.children &&
                  <SheetInterface />
                }
              </div>
            </>
            : <Loader></Loader>
          : <Login></Login>
      }
    </div>
  );
}

export default App;