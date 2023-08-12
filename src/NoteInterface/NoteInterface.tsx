import React, { useState } from 'react';
import "./NoteInterface.scss"
import { BiPencil } from "react-icons/bi";
import { Editor } from "primereact/editor";
import { Button } from "primereact/button";
import InputAndButton from '../Utils/InputAndButton/InputAndButton';
import ValidationDialog from '../Utils/ValidationDialog/ValidationDialog';
import axios from 'axios';
import { editNoteList } from '../Services/api';
import { useSelector, useDispatch } from "react-redux";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import parse from 'html-react-parser';

interface Props {
  note: Note,
  sortId: number
}

const NoteInterface = (props: Props) => {
  const [isModifyingTitle, setIsModifyingTitle] = useState<boolean | undefined>(false)
  const [isDeleting, setIsDeleting] = useState<boolean | undefined>(false)
  const [newTitle, setNewTitle] = useState<string>("")
  const [newContent, setNewContent] = useState<string>("")
  const [idModifyingNote, setIdModifyingNote] = useState<string | undefined>("");
  const data = useSelector((state: RootState) => state.data);
  const dispatch = useDispatch();
  const updateData = (value: Partial<DataState>) => {
    dispatch({ type: "UPDATE_DATA", value });
  };

  const modifyTitle = () => {
    if (newTitle === "") return
    const body: Note = { ...props.note, label: newTitle }
    axios
      .put(`${process.env.REACT_APP_BASE_URL}/note/${props.note._id}`, body)
      .then((res) => {
        if (data.notes) {
          const newNoteList: Array<Note> = editNoteList(data.notes, props.note, res.data.note)
          updateData({ notes: newNoteList })
        }
      })
      .catch((err) => console.log(err))
  }

  const modifyContent = () => {
    if (newContent === "") return
    const body: Note = { ...props.note, content: newContent }

    axios
      .put(`${process.env.REACT_APP_BASE_URL}/note/${props.note._id}`, body)
      .then((res) => {
        if (data.notes) {
          const newNoteList: Array<Note> = editNoteList(data.notes, props.note, res.data.note)
          updateData({ notes: newNoteList })
        }
      })
      .catch((err) => console.log(err))
  }

  const deleteNote = () => {
    if (!data.notes) return
    axios
      .delete(`${process.env.REACT_APP_BASE_URL}/note/${props.note._id}`)
      .then(() => {
        if (data.notes) {
          updateData({
            notes: data.notes.filter((note: Note) => note._id !== props.note?._id)
          })
        }
      })
      .catch((err) => console.log(err))
  }

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({ id: props.sortId });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div className="sheetinterface__notes__note" ref={setNodeRef} style={style} {...attributes}>
      <div className='dragndrop' {...listeners} style={{ cursor: "move", height: "5px" }}></div>
      <div className="note__title">
        {isModifyingTitle ?
          (
            <InputAndButton
              setIsModifying={setIsModifyingTitle}
              setNewString={setNewTitle}
              onValid={modifyTitle}
            ></InputAndButton>
          ) : (
            <>
              <h3>{props.note.label}</h3>
              <BiPencil onClick={() => setIsModifyingTitle(true)}></BiPencil>
            </>
          )}
      </div>
      <div
        className="note__content"
        onClick={() => setIdModifyingNote(props.note._id)}
      >
        {parse(props.note.content)}
      </div>
      <div className='pi pi-times-circle remove__icon' onClick={() => setIsDeleting(true)}></div>

      {idModifyingNote !== "" && (
        <div
          className="dialog__note"
          onClick={(e) => {
            if ((e.target as Element).className === "dialog__note") {
              setIdModifyingNote("");
            }
          }}
        >
          <div className="dialog__note__content">
            <Editor
              value={props.note ? props.note.content : "Undefined"}
              onTextChange={(e) => setNewContent(e.htmlValue ? e.htmlValue : "")}
            ></Editor>
            <Button className="save" onClick={() => {
              setIdModifyingNote("");
              modifyContent()
            }}>
              <div className="pi pi-save"></div>
            </Button>
          </div>
        </div>
      )}

      {isDeleting &&
        <ValidationDialog
          isVisible={isDeleting}
          setIsVisible={setIsDeleting}
          deleteFunction={deleteNote}
          element='note'
        ></ValidationDialog>
      }
    </div>
  );
};

export default NoteInterface;