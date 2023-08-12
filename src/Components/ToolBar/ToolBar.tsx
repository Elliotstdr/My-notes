import React, { useState } from "react";
import "./ToolBar.scss";
import { Button } from "primereact/button";
import InputAndButton from "../../Utils/InputAndButton/InputAndButton";
import ValidationDialog from "../../Utils/ValidationDialog/ValidationDialog";

interface Props {
  setNewTitle: React.Dispatch<React.SetStateAction<string>>;
  setNewElementName: React.Dispatch<React.SetStateAction<string>>;
  putFunction: () => void;
  createNewElement: () => void;
  deleteFunction: () => void;
  names: Array<string>;
  element: string;
}

const ToolBar = (props: Props) => {
  const [modifyElement, setModifyElement] = useState<boolean | undefined>(false);
  const [deleteElement, setDeleteElement] = useState<boolean | undefined>(false);
  const [createElement, setCreateElement] = useState<boolean | undefined>(false);
  return (
    <div className="toolbar">
      {/* Modify title button */}
      <Button
        onClick={() => setModifyElement(!modifyElement)}
        className="main__button"
      >
        <div className="pi pi-pencil" style={{ marginRight: "0.5rem" }}></div>
        Modifier le titre
      </Button>
      {/* Modify title input */}
      {modifyElement && (
        <InputAndButton
          setIsModifying={setModifyElement}
          setNewString={props.setNewTitle}
          onValid={props.putFunction}
        ></InputAndButton>
      )}
      {/* Delete element */}
      <Button onClick={() => setDeleteElement(true)} className="main__button">
        <div className="pi pi-trash" style={{ marginRight: "0.5rem" }}></div>
        {props.names[0]}
      </Button>
      {/* Create Element */}
      <Button onClick={() => setCreateElement(!createElement)} className="main__button">
        <div className="pi pi-plus" style={{ marginRight: "0.5rem" }}></div>
        {props.names[1]}
      </Button>
      {/* Create Element input */}
      {createElement && (
        <InputAndButton
          setIsModifying={setCreateElement}
          setNewString={props.setNewElementName}
          onValid={props.createNewElement}
        ></InputAndButton>
      )}
      {/* Delete Element Dialog */}
      {deleteElement && (
        <ValidationDialog
          isVisible={deleteElement}
          setIsVisible={setDeleteElement}
          deleteFunction={props.deleteFunction}
          element={props.element}
        ></ValidationDialog>
      )}
    </div>
  );
};

export default ToolBar;
