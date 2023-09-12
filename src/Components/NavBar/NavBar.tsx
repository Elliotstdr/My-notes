import React, { Key, useEffect, useState } from "react";
import { Tree, TreeDragDropEvent } from "primereact/tree";
import { TreeNode } from "primereact/treenode";
import { Button } from "primereact/button"
import "./NavBar.scss"
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import InputAndButton from "../../Utils/InputAndButton/InputAndButton";
import { handleDuplicates, successToast } from "../../Services/api";
import { logoNames } from "../../Services/data";
import CustomNode from "../CustomNode/CustomNode";

const NavBar = () => {
  const [expandedKeys, setExpandedKeys] = useState<any>({});
  const [nodes, setNodes] = useState<Array<TreeNode>>([]);
  const [activeCreatePage, setActiveCreatePage] = useState<boolean>(false)
  const [titleValue, setTitleValue] = useState<string>("")
  const auth = useSelector((state: RootState) => state.auth);
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
          let pageChildren = data.sheets?.filter((sheet: Sheet) => {
            if (sheet.page.id === page.id) {
              sheet.icon = logoNames.includes(sheet.label.toLowerCase())
                ? `devicon-${sheet.label.toLowerCase()}-original devicon-${sheet.label.toLowerCase()}-plain`
                : `pi pi-file`;
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
            id: page.id,
            label: page.label,
            icon: logoNames.includes(page.label.toLowerCase())
              ? `devicon-${page.label.toLowerCase()}-original devicon-${page.label.toLowerCase()}-plain`
              : `pi pi-folder`,
            children: pageChildren
          }
        })
      setNodes(tempNodes);
    }
  }, [data.pages, data.sheets])

  const createPage = () => {
    if (!data.pages) return;

    const body: Page = { label: handleDuplicates(titleValue, data.pages) }
    setTitleValue("")
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/page`, body, auth.header)
      .then((resPage) => {
        const body: Sheet = {
          label: "Index",
          page: resPage.data.page
        }
        axios
          .post(`${process.env.REACT_APP_BASE_URL}/sheet`, body, auth.header)
          .then((resSheet) => {
            if (data.sheets && data.pages) {
              updateData({
                sheets: [...data.sheets, resSheet.data.sheet],
                pages: [...data.pages, resPage.data.page],
                selectedNode: { ...resSheet.data.sheet }
              })
              let newExpandKey: any = {}
              newExpandKey[data.pages.length.toString()] = true
              setExpandedKeys(newExpandKey)
            }
          })
          .catch((err) => console.log(err))
      })
      .catch((err) => console.log(err))
  }

  const onDDPage = (event: TreeDragDropEvent) => {
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

  const changePageOrder = (pages: Array<Page>) => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/page/reorder`, pages, auth.header)
      .then((res) => {
        updateData({ pages: res.data.pages })
        data.toast && successToast("Ordre des pages mis à jour", data.toast)
      })
      .catch((err) => console.log(err))
  }

  const changeSheetOrder = (sheets: Array<Sheet>) => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/sheet/reorder`, sheets, auth.header)
      .then((res) => {
        const otherSheets = data.sheets?.filter((sheet: Sheet) =>
          !res.data.sheets.some((x: Sheet) => x.id === sheet.id
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

  const customNodeTemplate = (node: TreeNode) => {
    return <CustomNode node={node}></CustomNode>
  }

  return (
    <div className={`navbar ${!isVisible && "hidden"}`}>
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
            newString={titleValue}
            onValid={createPage}
          ></InputAndButton>
        }
      </div>
      <Tree
        value={nodes}
        onNodeClick={(e) => {
          if (e.node.children) {
            updateData({ selectedNode: e.node.children[0] });
            let tempArray = { ...expandedKeys }
            if (typeof e.node.key !== 'undefined' && e.node.key !== undefined) {
              if (
                tempArray[e.node.key.toString()] &&
                !(e.originalEvent.target as HTMLElement)?.className?.includes("menu")
              ) {
                delete tempArray[e.node.key.toString()];
              } else {
                tempArray[e.node.key.toString()] = true
              }
            }
            setExpandedKeys(tempArray)
          } else {
            updateData({ selectedNode: e.node });
          }
        }}
        onDragDrop={(e) => onDDPage(e)}
        dragdropScope="demo"
        nodeTemplate={customNodeTemplate}
        expandedKeys={expandedKeys}
        onToggle={(e) => setExpandedKeys(e.value)}
      />
      {isVisible ? (
        <div className="pi pi-angle-double-left" onClick={() => setIsVisible(false)}></div>
      ) : (<div className="pi pi-angle-double-right" onClick={() => setIsVisible(true)}></div>
      )}
    </div>
  );
};

export default NavBar;