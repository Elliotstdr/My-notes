import axios, { AxiosError, AxiosResponse } from "axios";
import { useState, useEffect } from "react";
import { store } from "../Store/store";

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

export const fetchDelete = async (url: string): Promise<FetchResponse> => {
  let data = null;
  let error = null;
  const token = store.getState().auth.token;
  
  await axios
    .delete(`${process.env.REACT_APP_BASE_URL}${url}`, { 
      headers: { Authorization: `Bearer ${token}` } 
    })
    .then((response) => (data = response.data))
    .catch((e) => (error = e));
  return { data, error };
};

export const fetchPost = async (url: string, payload: any,): Promise<FetchResponse> => {
  let data: any = null;
  let error: any = null;
  const token = store.getState().auth.token;

  await axios
    .post(`${process.env.REACT_APP_BASE_URL}${url}`, payload, {
      headers: { Authorization: `Bearer ${token}` } 
    })
    .then((response: AxiosResponse) => {
      data = response.data
    })
    .catch((e: AxiosError) => (error = e));
  return { data, error };
};

export const fetchPut = async (url: string, payload: any, ): Promise<FetchResponse> => {
  let data = null;
  let error: any = null;
  const token = store.getState().auth.token

  await axios
    .put(`${process.env.REACT_APP_BASE_URL}${url}`, payload, {
      headers: { Authorization: `Bearer ${token}` } 
    })
    .then((response: AxiosResponse) => {
      data = response.data
    })
    .catch((e: AxiosError) => (error = e));
  return { data, error };
};

export const successToast = (message: string, summary = "Succès") => {
  const ref: any = store.getState().data.toast
  ref.current.show({
    severity: "success",
    summary: `${summary} : `,
    detail: message,
    life: 3000,
  });
};

export const errorToast = (message: string, summary = "Erreur") => {
  const ref: any = store.getState().data.toast
  ref.current.show({
    severity: "error",
    summary: `${summary} : `,
    detail: message,
    life: 3000,
  });
};

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

/**
 * @param title titre de l'élément
 * @param data  liste des éléments
 * @returns un nouveau titre que ne soit pas déjà dans data
 */
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

export function customSortASC<T extends Page[]|Sheet[]|Note[]> (data: T): T {
  data.sort((a, b) => {
    if (a.order === undefined && b.order === undefined) { return 0 }
    if (a.order === undefined) { return -1 }
    if (b.order === undefined) { return 1 }
    return a.order - b.order;
  })
  return data
}