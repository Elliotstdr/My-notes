interface childNode {
  id?: string,
  label?: string,
  data?: string,
  children?: any,
  page?: Page | string
}

interface Page {
  id?: string,
  label: string,
  order?: number,
}

interface Note {
  id?: string,
  label: string,
  content: string,
  sheet: Sheet,
  order?: number,
}

interface Sheet {
  id?: string,
  label: string,
  page: Page,
  icon?: string,
  order?: number,
}

type FetchResponse = {
  data: any,
  error: any
}