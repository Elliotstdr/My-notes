import React, { useEffect, useRef, useState } from 'react';
import "./NoteInterface.scss"
import { Editor } from "primereact/editor";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import InputAndButton from '../../Utils/InputAndButton/InputAndButton';
import ValidationDialog from '../../Utils/ValidationDialog/ValidationDialog';
import axios from 'axios';
import { editNoteList, successToast, useOutsideAlerter } from '../../Services/api';
import { useSelector, useDispatch } from "react-redux";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import parse from 'html-react-parser';

interface Props {
  note: Note,
  sortId: number
}

const NoteInterface = (props: Props) => {
  const [isModifyingTitle, setIsModifyingTitle] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [showMenu, setShowMenu] = useState<boolean>(false)
  const [newTitle, setNewTitle] = useState<string>("")
  const [newContent, setNewContent] = useState<string>("")
  const [idModifyingNote, setIdModifyingNote] = useState<string | undefined>("");
  const wrapperRef = useRef(null);
  const auth = useSelector((state: RootState) => state.auth);
  const data = useSelector((state: RootState) => state.data);
  const dispatch = useDispatch();
  const updateData = (value: Partial<DataState>) => {
    dispatch({ type: "UPDATE_DATA", value });
  };

  useOutsideAlerter(wrapperRef, setShowMenu);

  const modifyTitle = () => {
    if (newTitle === "") return
    const body: Note = { ...props.note, label: newTitle }
    axios
      .put(`${process.env.REACT_APP_BASE_URL}/note/${props.note._id}`, body, auth.header)
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
      .put(`${process.env.REACT_APP_BASE_URL}/note/${props.note._id}`, body, auth.header)
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
      .delete(`${process.env.REACT_APP_BASE_URL}/note/${props.note._id}`, auth.header)
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

  const model = [
    {
      label: "Modifier le titre",
      icon: "pi pi-pencil",
      command: () => setIsModifyingTitle(!isModifyingTitle)
    },
    {
      label: "Modifier le contenu",
      icon: "pi pi-book",
      command: () => setIdModifyingNote(props.note._id)
    },
    {
      label: "Supprimer la note",
      icon: "pi pi-trash",
      command: () => setIsDeleting(true)
    }
  ]

  useEffect(() => {
    const codeBoxes = document.querySelectorAll('pre.ql-syntax');

    const element = document.createElement('div');
    element.className = 'clip pi pi-copy';
    element.addEventListener('click', (e) => {
      e.stopPropagation();

      const preElement = (e.target as HTMLElement).closest('pre.ql-syntax');
      if (preElement) {
        const textToCopy = preElement.textContent || '';
        navigator.clipboard.writeText(textToCopy)
        data.toast && successToast("Élément copié avec succès", data.toast)
      }
    });

    codeBoxes.forEach((x) => {
      if (x.childNodes.length === 1) {
        x.appendChild(element)
      }
    });
    // eslint-disable-next-line
  }, [props.note.content]);

  return (
    <div className="sheetinterface__notes__note" ref={setNodeRef} style={style} {...attributes}>
      <div className='dragndrop' {...listeners} style={{ cursor: "move", height: "10px" }}></div>
      <div className="note__top">
        <div className="note__top__title">
          {isModifyingTitle ?
            (
              <InputAndButton
                setIsModifying={setIsModifyingTitle}
                setNewString={setNewTitle}
                onValid={modifyTitle}
              ></InputAndButton>
            ) : (
              <h3>{props.note.label}</h3>
            )}
        </div>
        <div
          className='pi pi-ellipsis-v note__top__edit'
          onClick={() => setShowMenu(!showMenu)}
          ref={wrapperRef}
        >
          {showMenu && <Menu model={model}></Menu>}
        </div>
      </div>
      <div
        className="note__content"
        onClick={() => setIdModifyingNote(props.note._id)}
      >
        {parse(props.note.content)}
      </div>

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
              Save
              {/* <div className="pi pi-save"></div> */}
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