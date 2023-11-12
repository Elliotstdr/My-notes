import React, { Key, useEffect, useMemo, useState } from 'react';
import "./SheetInterface.scss"
import { fetchDelete, fetchPost, successToast } from '../../Services/api';
import NoteInterface from '../NoteInterface/NoteInterface';
import { useSelector, useDispatch } from "react-redux";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { Button } from 'primereact/button';
import ValidationDialog from '../../Utils/ValidationDialog/ValidationDialog';

const SheetInterface = () => {
  const [deleteElement, setDeleteElement] = useState<boolean>(false);
  const [notesList, setNotesListe] = useState<Array<Note>>([])
  const data = useSelector((state: RootState) => state.data);
  const dispatch = useDispatch();
  const updateData = (value: Partial<DataState>) => {
    dispatch({ type: "UPDATE_DATA", value });
  };

  const createNewNote = async () => {
    const sheetPage = data.sheets?.find((sheet: Sheet) => sheet.id === data.selectedNode.id)
    if (!data.selectedNode || !sheetPage || !data.notes) return

    const body: Note = { label: "New", content: "", sheet: sheetPage }
    const response = await fetchPost(`/note`, body)
    if (response.error) return

    updateData({ notes: [...data.notes, response.data.note] })
    const interval = setInterval(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
      clearInterval(interval)
    }, 100)
  };

  const deleteSheet = async () => {
    if (!data.selectedNode || !data.sheets) return

    const response = await fetchDelete(`/sheet/${data.selectedNode.id}`)
    if (response.error) return

    updateData({
      sheets: data.sheets.filter((sheet: Sheet) => sheet.id !== data.selectedNode?.id),
      selectedNode: data.pages ? { children: true } : {}
    })
  }

  useEffect(() => {
    data.notes && setNotesListe(data.notes
      .filter((note: Note) => note.sheet.id === data.selectedNode?.id)
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

  const updateNotesOrder = async (notes: Array<Note>) => {
    const response = await fetchPost('/note/reorder', notes)
    if (response.error) return

    const otherNotes = data.notes?.filter((note: Note) =>
      !response.data.notes.some((x: Sheet) => x.id === note.id
      ))
    const updatedNotes = otherNotes
      ? [...otherNotes, ...response.data.notes]
      : response.data.notes;
    updateData({ notes: updatedNotes });
    data.toast && successToast("Ordre des notes mis à jour")
  }

  const findPageOfSheet = () => {
    let page = undefined
    const node: any = data.selectedNode

    if (!node?.page || !data.pages) return

    if (typeof node.page === "string") {
      page = data.pages.find((page) => page.id === node.page)
    } else if (node.page.id) {
      page = data.pages.find((page) => page.id === node.page.id)
    }

    if (page) return page.label + "/ "

    return
  }

  return (
    <div className="sheetinterface">
      <div className="sheetinterface__top">
        <div className='page__label__sheet'>{findPageOfSheet()}</div>
        <h1>{data.selectedNode?.label}</h1>
        <div className="toolbar">
          {/* Delete element */}
          <Button onClick={() => setDeleteElement(true)} className="main__button">
            <div className="pi pi-trash" style={{ marginRight: "0.5rem" }}></div>
            {"Supprimer la feuille"}
          </Button>
          {/* Create Element */}
          <Button onClick={() => createNewNote()} className="main__button">
            <div className="pi pi-plus" style={{ marginRight: "0.5rem" }}></div>
            {"Créer une note"}
          </Button>
          {/* Delete Element Dialog */}
          {deleteElement && (
            <ValidationDialog
              isVisible={deleteElement}
              setIsVisible={setDeleteElement}
              deleteFunction={deleteSheet}
              element={'feuille'}
            ></ValidationDialog>
          )}
        </div>
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