import React, { useRef } from 'react';
import "./InputAndButton.scss"
import { useOutsideAlerter } from '../../Services/api';

interface Props {
  setNewString: React.Dispatch<React.SetStateAction<string>>
  newString?: string
  setIsModifying: React.Dispatch<React.SetStateAction<boolean>>
  onValid: () => void;
  width?: string,
}

const InputAndButton = (props: Props) => {
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, props.setIsModifying);
  return (
    <div className='inputandbutton' ref={wrapperRef} onClick={(e) => e.stopPropagation()}>
      <input
        style={{ width: props.width ? props.width : "" }}
        type="text"
        onChange={(e) => props.setNewString(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            props.setIsModifying(false);
            props.onValid();
          }
        }}
        autoFocus
      />
      <div className={
        props.newString && `
          devicon-${props.newString.toLowerCase()}-original 
          devicon-${props.newString.toLowerCase()}-plain 
          icon-proposition
        `}>
      </div>
    </div>
  );
};

export default InputAndButton;