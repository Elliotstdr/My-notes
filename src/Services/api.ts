import axios from "axios";
import { useState, useEffect } from "react";

export const useFetchGet = (url: string, token: string | null = null) => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>("");
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    token && url && url !== "" &&
      axios
        .get(`${process.env.REACT_APP_BASE_URL}${url}`, {
          headers:  
              {
                accept: "application/json",
                Authorization: `Bearer ${token}`
              },
        })
        .then((response: any) => {
          setData(response.data);
        })
        .catch((error: any) => setError(error.message))
        .finally(() => setLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, token]);
  return { data, error, loaded };
};

export const editPageList = (arrayElement: Array<Page>, currentPageId: string, newElement: Page) => {
  const tempPages: Array<Page> | null = [...arrayElement]
  tempPages.forEach((page: Page) => { 
    if (page.id === currentPageId) { 
      page.label = newElement.label 
    } 
  })
  return tempPages
}

export const editSheetList = (arrayElement: Array<Sheet>, currentSheet: Sheet | undefined, newElement: Sheet) => {
  const tempSheets: Array<Sheet> | null = [...arrayElement]
  tempSheets.forEach((sheet: Sheet) => { 
    if (sheet.id === currentSheet?.id) { 
      sheet.label = newElement.label 
    } 
  })
  return tempSheets
}

export const editNoteList = (arrayElement: Array<Note>, currentNote: Note | undefined, newElement: Note) => {
  const tempNotes: Array<Note> | null = [...arrayElement]
  tempNotes.forEach((note: Note) => { 
    if (note.id === currentNote?.id) { 
      note.label = newElement.label;
      note.content = newElement.content
    }
  })
  return tempNotes
}

export const successToast = (message: string, ref: React.MutableRefObject<any>, summary = "Succès") => {
  ref.current.show({
    severity: "success",
    summary: `${summary} : `,
    detail: message,
    life: 3000,
  });
};

export const errorToast = (message: string, ref: React.MutableRefObject<any>, summary = "Erreur") => {
  ref.current.show({
    severity: "error",
    summary: `${summary} : `,
    detail: message,
    life: 3000,
  });
};

export const getDefaultNode = (pages: Array<Page>) => {
  return {
    ...pages.sort((a: Page, b: Page) => {
      if (b.order !== undefined && a.order !== undefined) {
        return a.order - b.order
      }
      return 0
    })[0],
    children: true
  }
}

export const useOutsideAlerter = (ref: any, command: React.Dispatch<React.SetStateAction<boolean>>) => {
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        command(false)
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line
  }, [ref])
};

export const handleDuplicates = (title: string, data: Array<Page|Sheet>) => {
  let titreUnique = title;
  let numSuffix = 1;

  // eslint-disable-next-line
  while (data.some((x: Page|Sheet) => x.label === titreUnique)) {
    titreUnique = `${title}-${numSuffix}`;
    numSuffix++;
  }

  return titreUnique;
}