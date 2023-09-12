import React, { useRef, useState } from 'react';
import "./CustomNode.scss"
import { Menu } from "primereact/menu";
import { TreeNode } from 'primereact/treenode';
import { editPageList, getDefaultNode, handleDuplicates, useOutsideAlerter } from '../../Services/api';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import InputAndButton from '../../Utils/InputAndButton/InputAndButton';
import ValidationDialog from '../../Utils/ValidationDialog/ValidationDialog';

interface Props {
  node: TreeNode,
}
const CustomNode = (props: Props) => {
  const [showMenu, setShowMenu] = useState<boolean>(false)
  const [isModifyingTitle, setIsModifyingTitle] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [newTitle, setNewTitle] = useState<string>("")
  const auth = useSelector((state: RootState) => state.auth);
  const data = useSelector((state: RootState) => state.data);
  const dispatch = useDispatch();
  const updateData = (value: Partial<DataState>) => {
    dispatch({ type: "UPDATE_DATA", value });
  };
  const wrapperRef = useRef(null);

  useOutsideAlerter(wrapperRef, setShowMenu);

  const model = [
    {
      label: "Modifier le titre",
      icon: "pi pi-pencil",
      command: () => setIsModifyingTitle(!isModifyingTitle)
    },
    {
      label: "Supprimer la page",
      icon: "pi pi-trash",
      command: () => setIsDeleting(!isDeleting)
    },
    {
      label: "Créer une feuille",
      icon: "pi pi-plus",
      command: () => createNewSheet()
    }
  ]

  const putPage = () => {
    if (newTitle === "" || !data.pages) return

    const body: Page = { label: handleDuplicates(newTitle, data.pages) }
    axios
      .put(`${process.env.REACT_APP_BASE_URL}/page/${props.node.id}`, body, auth.header)
      .then((res) => {
        if (data.pages && props.node.id) {
          const newPageList: Array<Page> = editPageList(data.pages, props.node.id, res.data.page)
          updateData({
            pages: newPageList,
          })
        }
      })
      .catch((err) => console.log(err))
  };

  const createNewSheet = () => {
    const sheetPage = data.pages?.find((page: Page) => page.id === props.node.id)
    if (!sheetPage || !data.sheets) return

    const body: Sheet = {
      label: handleDuplicates("Index", data.sheets.filter((x) => x.page.id === sheetPage.id)),
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
    axios
      .delete(`${process.env.REACT_APP_BASE_URL}/page/${props.node.id}`, auth.header)
      .then(() => {
        if (data.pages && props.node.id) {
          updateData({
            pages: data.pages.filter((page: Page) => page.id !== props.node.id),
            selectedNode: getDefaultNode(data.pages)
          })
        }
      })
      .catch((err) => console.log(err))
  }

  return (
    <div className="customNode">
      <span className={`customNode__label ${props.node.id === data.selectedNode.id && "selected"}`}>
        {isModifyingTitle ?
          (
            <InputAndButton
              setIsModifying={setIsModifyingTitle}
              setNewString={setNewTitle}
              onValid={putPage}
              width='7rem'
            ></InputAndButton>
          ) : (
            <span>{props.node.label}</span>
          )}
      </span>
      {props.node.children &&
        <div
          className='pi pi-ellipsis-v customNode__menu'
          onClick={() => setShowMenu(!showMenu)}
          ref={wrapperRef}
        >
          {showMenu && <Menu model={model}></Menu>}
        </div>
      }
      {isDeleting &&
        <ValidationDialog
          isVisible={isDeleting}
          setIsVisible={setIsDeleting}
          deleteFunction={deletePage}
          element='page'
        ></ValidationDialog>
      }
    </div>
  );
};

export default CustomNode;