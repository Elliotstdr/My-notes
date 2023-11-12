import React, { useEffect, useRef, useState } from 'react';
import "./NoteInterface.scss"
import { Editor } from "primereact/editor";
import ValidationDialog from '../../Utils/ValidationDialog/ValidationDialog';
import { fetchDelete, fetchPut, successToast } from '../../Services/api';
import { useSelector, useDispatch } from "react-redux";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import parse from 'html-react-parser';

interface Props {
  note: Note,
  sortId: number
}

const NoteInterface = (props: Props) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [newTitle, setNewTitle] = useState<string>(props.note.label)
  const [newContent, setNewContent] = useState<string>("")
  const [idModifyingNote, setIdModifyingNote] = useState<string | undefined>("");
  const data = useSelector((state: RootState) => state.data);
  const dispatch = useDispatch();
  const updateData = (value: Partial<DataState>) => {
    dispatch({ type: "UPDATE_DATA", value });
  };

  useEffect(() => { setNewTitle(props.note.label) }, [props.note])

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    scrollRef.current && scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const modifyTitle = async () => {
    if (newTitle === "" || !data.notes) return

    const body = { label: newTitle }
    const response = await fetchPut(`/note/${props.note.id}`, body)
    if (response.error) return

    updateData({
      notes: data.notes.map((note) =>
        note.id === props.note?.id
          ? { ...note, label: response.data.note.label, content: response.data.note.content }
          : note
      ),
    });
  }

  const modifyContent = async () => {
    if (newContent === "" || !data.notes) return

    const body = { content: newContent }
    const response = await fetchPut(`/note/${props.note.id}`, body)
    if (response.error) return

    updateData({
      notes: data.notes.map((note) =>
        note.id === props.note?.id
          ? { ...note, label: response.data.note.label, content: response.data.note.content }
          : note
      ),
    });
  }

  const deleteNote = async () => {
    if (!data.notes) return

    const response = await fetchDelete(`/note/${props.note.id}`)
    if (response.error) return

    updateData({ notes: data.notes.filter((note: Note) => note.id !== props.note?.id) })
  }

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({ id: props.sortId });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    const codeBoxes = document.querySelectorAll('pre.ql-syntax');

    codeBoxes.forEach((x) => {
      const existingDiv = x.querySelector('.clip.pi.pi-copy');

      if (existingDiv) return

      const element = document.createElement('div');
      element.className = 'clip pi pi-copy';
      element.addEventListener('click', (e) => {
        e.stopPropagation();

        const preElement = (e.target as HTMLElement).closest('pre.ql-syntax');
        if (!preElement) return

        const textToCopy = preElement.textContent || '';
        navigator.clipboard.writeText(textToCopy)
        data.toast && successToast("Élément copié avec succès");
      });

      x.appendChild(element);
    });
    // eslint-disable-next-line
  }, [props.note.content]);

  const modules = {
    clipboard: {
      matchVisual: false
    }
  }

  return (
    <div className="sheetinterface__notes__note" ref={setNodeRef} style={style} {...attributes}>
      <div className='dragndrop' {...listeners} style={{ cursor: "move", height: "10px" }}></div>
      <div className="note__top">
        <div className="note__top__title">
          <input
            className='input__edit note'
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={() => props.note.label !== newTitle && modifyTitle()}
          ></input>
        </div>
        <div className='pi pi-trash' onClick={() => setIsDeleting(true)}></div>
      </div>
      <div
        className="note__content"
        onClick={() => setIdModifyingNote(props.note.id)}
        ref={scrollRef}
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
              modules={modules}
              onBlur={() => {
                setIdModifyingNote("");
                modifyContent()
              }}
            ></Editor>
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