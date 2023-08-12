import React, { Key, useEffect, useState } from "react";
import { Tree, TreeDragDropEvent } from "primereact/tree";
import { TreeNode } from "primereact/treenode";
import { Button } from "primereact/button"
import "./NavBar.scss"
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import InputAndButton from "../../Utils/InputAndButton/InputAndButton";
import { successToast } from "../../Services/api";

const NavBar = () => {
  const [nodes, setNodes] = useState<Array<TreeNode>>([]);
  const [activeCreatePage, setActiveCreatePage] = useState<boolean | undefined>(false)
  const [titleValue, setTitleValue] = useState<string>("")
  const data = useSelector((state: RootState) => state.data);
  const dispatch = useDispatch();
  const updateData = (value: Partial<DataState>) => {
    dispatch({ type: "UPDATE_DATA", value });
  };
  const [isVisible, setIsVisible] = useState<boolean>(true)

  useEffect(() => {
    if (data.pages && data.sheets) {
      let tempNodes: Array<TreeNode> = data.pages
        .sort((a, b) => {
          if (b.order !== undefined && a.order !== undefined) {
            return a.order - b.order
          }
          return 0
        })
        .map((page: Page, key: Key) => {
          const pageChildren = data.sheets?.filter((sheet: Sheet) => {
            if (sheet.page._id === page._id) {
              sheet.icon = "pi pi-file";
              return true;
            }
            return false
          }).sort((a, b) => {
            if (b.order !== undefined && a.order !== undefined) {
              return a.order - b.order
            }
            return 0
          })
          return {
            key: key,
            _id: page._id,
            label: page.label,
            icon: "pi pi-folder",
            children: pageChildren
          }
        })
      setNodes(tempNodes);
    }
  }, [data.pages, data.sheets])

  const createPage = () => {
    const body: Page = { label: titleValue }
    setTitleValue("")
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/page`, body)
      .then((res) => {
        data.pages && updateData({ pages: [...data.pages, res.data.page] })
      })
      .catch((err) => console.log(err))
  }

  const onDDPage = (event: TreeDragDropEvent) => {
    const dragNode: any = event.dragNode;
    const dropNode: any = event.dropNode;
    const dropValues: any = event.value;
    if (dragNode.page) {
      if (dragNode.page._id === dropNode._id) {
        const sheets: Array<Sheet> = dropNode.children.map((x: Sheet, key: number) => {
          return {
            _id: x._id,
            label: x.label,
            page: x.page,
            order: key
          }
        })
        changeSheetOrder(sheets)
      }
    } else if (!dropNode) {
      const pages: Array<Page> = dropValues.map((x: Page, key: number) => {
        return {
          _id: x._id,
          label: x.label,
          order: key
        }
      })
      changePageOrder(pages)
    }
  }

  const changePageOrder = (pages: Array<Page>) => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/page/reorder`, pages)
      .then((res) => {
        updateData({ pages: res.data.pages })
        data.toast && successToast("Ordre des pages mis à jour", data.toast)
      })
      .catch((err) => console.log(err))
  }

  const changeSheetOrder = (sheets: Array<Sheet>) => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/sheet/reorder`, sheets)
      .then((res) => {
        const otherSheets = data.sheets?.filter((sheet: Sheet) =>
          !res.data.sheets.some((x: Sheet) => x._id === sheet._id
          ))
        if (otherSheets) {
          updateData({ sheets: [...otherSheets, ...res.data.sheets] })
        } else {
          updateData({ sheets: res.data.sheets })
        }
        data.toast && successToast("Ordre des feuilles mis à jour", data.toast)
      })
      .catch((err) => console.log(err))
  }

  return (
    <div className={`navbar ${!isVisible && "hidden"}`}>
      {isVisible ? (
        <>
          <div className="navbar__buttons">
            <Button
              className="createButton"
              onClick={() => setActiveCreatePage(!activeCreatePage)}
            >
              <div className="pi pi-plus"></div>
              {"Create Page"}
            </Button>
            {activeCreatePage &&
              <InputAndButton
                setIsModifying={setActiveCreatePage}
                setNewString={setTitleValue}
                onValid={createPage}
              ></InputAndButton>
            }
          </div>
          <Tree
            value={nodes}
            onNodeClick={(e) => updateData({ selectedNode: e.node })}
            onDragDrop={(e) => onDDPage(e)}
            dragdropScope="demo"
          />
          <div className="pi pi-angle-double-left" onClick={() => setIsVisible(false)}></div>
        </>
      ) : (<div className="pi pi-angle-double-right" onClick={() => setIsVisible(true)}></div>
      )}
    </div>
  );
};

export default NavBar;