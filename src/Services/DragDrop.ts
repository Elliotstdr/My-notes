import axios from "axios";
import { TreeDragDropEvent } from "primereact/tree";
import { TreeNode } from "primereact/treenode";
import { successToast } from "./api";
import { store } from "../Store/store";

function updateData(value: Partial<DataState>) {
  return {
    type: 'UPDATE_DATA',
    value
  }
}
export const onDragDrop = (event: TreeDragDropEvent) => {
  const dragNode: any = event.dragNode;
  const dropNode: any = event.dropNode;
  const dropValues: any = event.value;

  if (dragNode.page) {
    if (dragNode.page.id === dropNode.id) {
      const sheets: Array<Sheet> = dropNode.children.map((x: Sheet, key: number) => {
        return {
          id: x.id,
          label: x.label,
          page: x.page,
          order: key
        }
      })
      changeSheetOrder(sheets)
    }
  } else if (!dropNode) {
    const pages: Array<Page> = dropValues.map((x: TreeNode, key: number) => {
      return {
        id: x.id,
        label: x.label,
        order: key
      }
    })
    changePageOrder(pages)
  }
}

export const changePageOrder = (pages: Array<Page>) => {
  const data = store.getState().data
  const auth = store.getState().auth

  axios
    .post(`${process.env.REACT_APP_BASE_URL}/page/reorder`, pages, auth.header)
    .then((res) => {
      store.dispatch(updateData({ pages: res.data.pages }))
      data.toast && successToast("Ordre des pages mis à jour")
    })
    .catch((err) => console.log(err))
}

export const changeSheetOrder = (sheets: Array<Sheet>) => {
  const data = store.getState().data
  const auth = store.getState().auth

  axios
    .post(`${process.env.REACT_APP_BASE_URL}/sheet/reorder`, sheets, auth.header)
    .then((res) => {
      const otherSheets = data.sheets?.filter((sheet: Sheet) =>
        !res.data.sheets.some((x: Sheet) => x.id === sheet.id
        ))
      if (otherSheets) {
        store.dispatch(updateData({ sheets: [...otherSheets, ...res.data.sheets] }))
      } else {
        store.dispatch(updateData({ sheets: res.data.sheets }))
      }
      data.toast && successToast("Ordre des feuilles mis à jour")
    })
    .catch((err) => console.log(err))
}