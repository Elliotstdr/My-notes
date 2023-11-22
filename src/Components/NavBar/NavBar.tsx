import React, { Key, useEffect, useState } from "react";
import { Tree, TreeNodeClickEvent } from "primereact/tree";
import { TreeNode } from "primereact/treenode";
import { Button } from "primereact/button"
import "./NavBar.scss"
import { useSelector, useDispatch } from "react-redux";
import InputAndButton from "../../Utils/InputAndButton/InputAndButton";
import { customSortASC, fetchPost, handleDuplicates } from "../../Services/api";
import { logoNames } from "../../Services/data";
import CustomNode from "../CustomNode/CustomNode";
import { onDragDrop } from "../../Services/DragDrop";

const NavBar = () => {
  const [nodes, setNodes] = useState<Array<TreeNode>>([]);
  const [activeCreatePage, setActiveCreatePage] = useState<boolean>(false)
  const [titleValue, setTitleValue] = useState<string>("")
  const data = useSelector((state: RootState) => state.data);
  const dispatch = useDispatch();
  const updateData = (value: Partial<DataState>) => {
    dispatch({ type: "UPDATE_DATA", value });
  };
  const [isVisible, setIsVisible] = useState<boolean>(true)

  useEffect(() => {
    if (!data.pages || !data.sheets) return
    let tempNodes: Array<TreeNode> = customSortASC(data.pages).map((page: Page, key: Key) => {
      let pageChildren = data.sheets!
      pageChildren = customSortASC(pageChildren).filter((sheet: Sheet) => {
        if (sheet.page.id === page.id) {
          sheet.icon = logoNames.includes(sheet.label.toLowerCase())
            ? `devicon-${sheet.label.toLowerCase()}-original devicon-${sheet.label.toLowerCase()}-plain`
            : `pi pi-file`;
          return true;
        }
        return false
      })
      return {
        key: key as number,
        id: page.id,
        label: page.label,
        icon: logoNames.includes(page.label.toLowerCase())
          ? `devicon-${page.label.toLowerCase()}-original devicon-${page.label.toLowerCase()}-plain`
          : `pi pi-folder`,
        children: pageChildren
      }
    })
    setNodes(tempNodes);
  }, [data.pages, data.sheets])

  const createPage = async () => {
    if (!data.pages || !data.sheets) return;

    setTitleValue("")

    const body: Page = { label: handleDuplicates(titleValue, data.pages) }
    const resPage = await fetchPost("/page", body)
    if (resPage.error) return

    const subBody: Sheet = {
      label: "Index",
      page: resPage.data.page
    }
    const resSheet = await fetchPost("/sheet", subBody)
    if (resSheet.error) return

    updateData({
      sheets: [...data.sheets, resSheet.data.sheet],
      pages: [...data.pages, resPage.data.page],
      selectedNode: { ...resSheet.data.sheet },
      expandedKeys: { [data.pages.length.toString()]: true }
    })
  }

  const onNodeClick = (e: TreeNodeClickEvent) => {
    // Si c'est un feuille on change le selectedNode
    if (!e.node.children) {
      updateData({ selectedNode: e.node });
      return
    }
    // Si on clique sur le menu ou le nom de la page on ne fait rien
    if ((e.originalEvent.target as HTMLElement)?.className?.includes("menu") ||
      (e.originalEvent.target as HTMLElement)?.className?.includes("page")) return
    // Si pas de key on ne fait rien
    if (e.node.key === 'undefined' || e.node.key === undefined) return

    // Si expand on close, sinon on expand
    let tempArray = { ...data.expandedKeys }
    if (tempArray[e.node.key.toString()]) {
      delete tempArray[e.node.key.toString()];
    } else {
      tempArray[e.node.key.toString()] = true
    }
    updateData({ expandedKeys: tempArray })
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
        onNodeClick={(e) => onNodeClick(e)}
        onDragDrop={(e) => onDragDrop(e)}
        dragdropScope="demo"
        nodeTemplate={customNodeTemplate}
        expandedKeys={data.expandedKeys}
        onToggle={(e) => updateData({ expandedKeys: e.value })}
      />
      <div
        className={`pi pi-angle-double-${isVisible ? 'left' : 'right'}`}
        onClick={() => setIsVisible(!isVisible)}>
      </div>
    </div>
  );
};

export default NavBar;