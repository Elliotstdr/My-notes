import React from 'react';
import "./ValidationDialog.scss"
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

interface Props {
  isVisible: boolean | undefined;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  deleteFunction: () => void
  element: string
}

const ValidationDialog = (props: Props) => {
  return (
    <Dialog
      header={`Supprimer la ${props.element}`}
      visible={props.isVisible}
      style={{ width: "fit-content" }}
      onHide={() => props.setIsVisible(false)}
      onClick={(e) => e.stopPropagation()}
    >
      <div className='validationdialog'>
        <span>{`Etes vous sur de vouloir supprimer cette ${props.element} ?`}</span>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "1rem",
          }}
        >
          <Button
            style={{
              marginRight: "1rem",
              background: "#367E18",
              borderColor: "#367E18",
            }}
            onClick={() => {
              props.setIsVisible(false)
              props.deleteFunction()
            }}
          >
            Oui
          </Button>
          <Button
            onClick={() => props.setIsVisible(false)}
            style={{ background: "#CC3636", borderColor: "#CC3636" }}
          >
            Non
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default ValidationDialog;