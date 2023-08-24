import React, { Key, useEffect, useMemo, useState } from 'react';
import "./SheetInterface.scss"
import ToolBar from '../ToolBar/ToolBar';
import axios from 'axios';
import { editSheetList, getDefaultNode, successToast } from '../../Services/api';
import NoteInterface from '../NoteInterface/NoteInterface';
import { useSelector, useDispatch } from "react-redux";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";

const SheetInterface = () => {
  const [newTitle, setNewTitle] = useState<string>("");
  const [newNoteName, setNewNoteName] = useState<string>("");
  const [notesList, setNotesListe] = useState<Array<Note>>([])
  const auth = useSelector((state: RootState) => state.auth);
  const data = useSelector((state: RootState) => state.data);
  const dispatch = useDispatch();
  const updateData = (value: Partial<DataState>) => {
    dispatch({ type: "UPDATE_DATA", value });
  };

  const putSheet = () => {
    const sheetPage = data.sheets?.find((sheet: Sheet) => sheet._id === data.selectedNode._id)
    if (!data.selectedNode || newTitle === "" || !sheetPage) return

    const body: Sheet = { label: newTitle, page: sheetPage.page }
    axios
      .put(`${process.env.REACT_APP_BASE_URL}/sheet/${data.selectedNode?._id}`, body, auth.header)
      .then((res) => {
        if (data.sheets) {
          const newSheetList: Array<Sheet> = editSheetList(data.sheets, sheetPage, res.data.sheet)
          updateData({
            sheets: newSheetList,
            selectedNode: res.data.sheet
          })
        }
      })
      .catch((err) => console.log(err))
  };

  const createNewNote = () => {
    const sheetPage = data.sheets?.find((sheet: Sheet) => sheet._id === data.selectedNode._id)
    if (!data.selectedNode || newNoteName === "" || !sheetPage) return

    const body: Note = { label: newNoteName, content: "", sheet: sheetPage }
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/note`, body, auth.header)
      .then((res) => {
        if (data.notes) {
          updateData({ notes: [...data.notes, res.data.note] })
        }
      })
      .catch((err) => console.log(err))
  };

  const deleteSheet = () => {
    if (!data.selectedNode) return

    axios
      .delete(`${process.env.REACT_APP_BASE_URL}/sheet/${data.selectedNode._id}`, auth.header)
      .then(() => {
        if (data.sheets) {
          updateData({
            sheets: data.sheets.filter((sheet: Sheet) => sheet._id !== data.selectedNode?._id),
            selectedNode: data.pages ? getDefaultNode(data.pages) : {}
          })
        }
      })
      .catch((err) => console.log(err))
  }

  useEffect(() => {
    data.notes && setNotesListe(data.notes
      .filter((note: Note) => note.sheet._id === data.selectedNode?._id)
      .sort((a, b) => {
        if (b.order !== undefined && a.order !== undefined) {
          return a.order - b.order
        }
        return 0
      }))
    // eslint-disable-next-line
  }, [data.selectedNode, data.notes])

  const itemsOrders = useMemo(
    () => notesList.map((item) => {
      if (item.order !== undefined) {
        return item.order + 1
      } else {
        return 0
      }
    }),
    [notesList]
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = notesList?.findIndex(
        (item) => item.order === active.id - 1
      );
      const newIndex = notesList?.findIndex(
        (item) => item.order === over.id - 1
      );
      const newArray = arrayMove(notesList, oldIndex, newIndex);

      for (const [key, value] of Object.entries(newArray)) {
        value.order = Number(key)
      }

      setNotesListe(newArray);
      updateNotesOrder(newArray)
    }
  };

  const updateNotesOrder = (notes: Array<Note>) => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/note/reorder`, notes, auth.header)
      .then((res) => {
        const otherNotes = data.notes?.filter((note: Note) =>
          !res.data.notes.some((x: Sheet) => x._id === note._id
          ))
        if (otherNotes) {
          updateData({ notes: [...otherNotes, ...res.data.notes] })
        } else {
          updateData({ notes: res.data.notes })
        }
        data.toast && successToast("Ordre des notes mis à jour", data.toast)
      })
      .catch((err) => console.log(err))
  }

  return (
    <div className="sheetinterface">
      <div className="sheetinterface__top">
        <h1>{data.selectedNode?.label}</h1>
        <ToolBar
          setNewTitle={setNewTitle}
          setNewElementName={setNewNoteName}
          putFunction={putSheet}
          createNewElement={createNewNote}
          deleteFunction={deleteSheet}
          names={["Supprimer la feuille", "Créer une note"]}
          element='sheet'
        ></ToolBar>
      </div>
      <div className="sheetinterface__notes">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={itemsOrders}
          >
            {notesList && notesList
              .map((note: Note, key: Key) => (
                <NoteInterface
                  key={key}
                  note={note}
                  sortId={note.order !== undefined ? note.order + 1 : 0}
                ></NoteInterface>
              ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default SheetInterface;