import React from 'react';
import "./InputAndButton.scss"
import { Button } from "primereact/button";

interface Props {
  setNewString: React.Dispatch<React.SetStateAction<string>>
  setIsModifying: React.Dispatch<React.SetStateAction<boolean | undefined>>
  onValid: () => void
}

const InputAndButton = (props: Props) => {
  return (
    <div className='inputandbutton'>
      <input
        type="text"
        onChange={(e) => props.setNewString(e.target.value)}
      />
      <Button
        className='validation'
        onClick={() => {
          props.setIsModifying(false);
          props.onValid();
        }}
      >
        <div className="pi pi-check"></div>
      </Button>
    </div>
  );
};

export default InputAndButton;