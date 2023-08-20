import React, { useState } from "react";
import "./PageInterface.scss";
import ToolBar from "../ToolBar/ToolBar";
import axios from "axios";
import { editPageList, getDefaultNode } from "../../Services/api";
import { useSelector, useDispatch } from "react-redux";

const PageInterface = () => {
  const [newTitle, setNewTitle] = useState<string>("");
  const [newSheetName, setNewSheetName] = useState<string>("");
  const auth = useSelector((state: RootState) => state.auth);
  const data = useSelector((state: RootState) => state.data);
  const dispatch = useDispatch();
  const updateData = (value: Partial<DataState>) => {
    dispatch({ type: "UPDATE_DATA", value });
  };

  const putPage = () => {
    if (newTitle === "" || !data.selectedNode) return

    const body: Page = { label: newTitle }
    axios
      .put(`${process.env.REACT_APP_BASE_URL}/page/${data.selectedNode._id}`, body, auth.header)
      .then((res) => {
        if (data.pages && data.selectedNode) {
          const newPageList: Array<Page> = editPageList(data.pages, data.selectedNode, res.data.page)
          updateData({
            pages: newPageList,
            selectedNode: { ...res.data.page, children: true }
          })
        }
      })
      .catch((err) => console.log(err))
  };

  const createNewSheet = () => {
    const sheetPage = data.pages?.find((page: Page) => page._id === data.selectedNode._id)
    if (newSheetName === "" || !data.selectedNode || !sheetPage) return

    const body: Sheet = {
      label: newSheetName,
      page: sheetPage
    }

    axios
      .post(`${process.env.REACT_APP_BASE_URL}/sheet`, body, auth.header)
      .then((res) => {
        if (data.sheets) {
          updateData({
            sheets: [...data.sheets, res.data.sheet],
            selectedNode: { ...res.data.sheet }
          })
        }
      })
      .catch((err) => console.log(err))
  };

  const deletePage = () => {
    if (!data.selectedNode) return

    axios
      .delete(`${process.env.REACT_APP_BASE_URL}/page/${data.selectedNode._id}`, auth.header)
      .then(() => {
        if (data.pages && data.selectedNode) {
          updateData({
            pages: data.pages.filter((page: Page) => page._id !== data.selectedNode?._id),
            selectedNode: getDefaultNode(data.pages)
          })
        }
      })
      .catch((err) => console.log(err))
  }

  return (
    <div className="pageinterface">
      <ToolBar
        setNewTitle={setNewTitle}
        setNewElementName={setNewSheetName}
        putFunction={putPage}
        createNewElement={createNewSheet}
        deleteFunction={deletePage}
        names={["Supprimer la page", "Créer une feuille"]}
        element="page"
      ></ToolBar>
      <h1>{data.selectedNode?.label}</h1>
    </div>
  );
};

export default PageInterface;
