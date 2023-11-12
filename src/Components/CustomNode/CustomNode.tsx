import React, { useEffect, useRef, useState } from 'react';
import "./CustomNode.scss"
import { Menu } from "primereact/menu";
import { TreeNode } from 'primereact/treenode';
import { fetchDelete, fetchPost, fetchPut, handleDuplicates, useOutsideAlerter } from '../../Services/api';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import ValidationDialog from '../../Utils/ValidationDialog/ValidationDialog';

interface Props {
  node: TreeNode,
}
const CustomNode = (props: Props) => {
  const [showMenu, setShowMenu] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [newTitle, setNewTitle] = useState<string>(props.node.label ?? "")
  const data = useSelector((state: RootState) => state.data);
  const dispatch = useDispatch();
  const updateData = (value: Partial<DataState>) => {
    dispatch({ type: "UPDATE_DATA", value });
  };
  const wrapperRef = useRef(null);

  useOutsideAlerter(wrapperRef, setShowMenu);

  useEffect(() => {
    setNewTitle(props.node.label ?? "")
  }, [props.node])

  const model = [
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

  const putPage = async () => {
    if (newTitle === "" || !data.pages || !props.node.id) return

    const body: Page = { label: handleDuplicates(newTitle, data.pages) }
    const response = await fetchPut(`/page/${props.node.id}`, body)
    if (response.error) return

    updateData({
      pages: data.pages.map((page) =>
        page.id === props.node.id ? { ...page, label: response.data.page.label } : page
      ),
    });
  };

  const putSheet = async () => {
    const currentSheet = data.sheets?.find((sheet: Sheet) => sheet.id === data.selectedNode.id)
    if (!data.selectedNode || newTitle === "" || !currentSheet || !data.sheets) return

    const body = {
      label: handleDuplicates(newTitle, data.sheets.filter((x) => x.page.id === currentSheet.page.id)),
    }
    const response = await fetchPut(`/sheet/${data.selectedNode?.id}`, body)
    if (response.error) return

    updateData({
      sheets: data.sheets.map((sheet) =>
        sheet.id === currentSheet?.id ? { ...sheet, label: response.data.sheet.label } : sheet
      ),
      selectedNode: response.data.sheet,
    });
  };

  const createNewSheet = async () => {
    const sheetPage = data.pages?.find((page: Page) => page.id === props.node.id)
    if (!sheetPage || !data.sheets) return

    const body: Sheet = {
      label: handleDuplicates("New", data.sheets.filter((x) => x.page.id === sheetPage.id)),
      page: sheetPage
    }
    const response = await fetchPost(`/sheet`, body)
    if (response.error) return

    updateData({
      sheets: [...data.sheets, response.data.sheet],
      selectedNode: { ...response.data.sheet }
    })
  };

  const deletePage = async () => {
    if (!data.pages || !props.node.id) return

    const response = await fetchDelete(`/page/${props.node.id}`)
    if (response.error) return

    updateData({
      pages: data.pages.filter((page: Page) => page.id !== props.node.id),
      selectedNode: { children: true }
    })
  }

  return (
    <div className="customNode">
      <span className={`customNode__label ${props.node.id === data.selectedNode.id && "selected"}`}>
        <input
          className='input__edit page'
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onBlur={() => {
            if (props.node.label === newTitle) return
            if (props.node.children) {
              putPage()
            } else {
              putSheet()
            }
          }}
        ></input>
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