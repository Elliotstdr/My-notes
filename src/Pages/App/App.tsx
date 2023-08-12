import React, { useEffect, useRef } from 'react';
import './App.scss';
import NavBar from '../../Components/NavBar/NavBar';
import { getDefaultNode, useFetchGet } from '../../Services/api';
import SheetInterface from '../../Components/SheetInterface/SheetInterface';
import PageInterface from '../../Components/PageInterface/PageInterface';
import { useSelector, useDispatch } from "react-redux";
import Loader from '../../Utils/Loader/loader';
import { Toast } from "primereact/toast";

const App = () => {
  const data = useSelector((state: RootState) => state.data);
  const dispatch = useDispatch();
  const updateData = (value: Partial<DataState>) => {
    dispatch({ type: "UPDATE_DATA", value });
  };

  const toast = useRef(null);
  const pageData = useFetchGet("/page")
  const sheetData = useFetchGet("/sheet")
  const noteData = useFetchGet("/note")

  useEffect(() => {
    if (pageData.loaded && sheetData.loaded && noteData.loaded) {
      updateData({
        pages: pageData.data,
        sheets: sheetData.data,
        notes: noteData.data
      })
    }
    // eslint-disable-next-line
  }, [pageData.loaded, sheetData.loaded, noteData.loaded])

  useEffect(() => {
    pageData.loaded && updateData({
      toast: toast,
      selectedNode: Object.keys(data.selectedNode).length === 0
        ? getDefaultNode(pageData.data)
        : data.selectedNode
    })
    // eslint-disable-next-line
  }, [pageData.loaded])

  return (
    <div className="App">
      <Toast ref={toast}></Toast>
      {data.pages && data.notes &&
        data.sheets && Object.keys(data.selectedNode).length !== 0 ?
        <>
          <NavBar />
          <div className="App__main">
            {data.selectedNode.children ? (
              <PageInterface />
            ) : (noteData.loaded &&
              <SheetInterface />
            )}</div>
        </>
        : <Loader></Loader>}
    </div>
  );
}

export default App;