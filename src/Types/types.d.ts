interface childNode {
  _id?: string,
  label?: string,
  data?: string,
  children?: any,
}

interface Page {
  _id?: string,
  label: string,
  order?: number,
}

interface Note {
  _id?: string,
  label: string,
  content: string,
  sheet: Sheet,
  order?: number,
}

interface Sheet {
  _id?: string,
  label: string,
  page: Page,
  icon?: string,
  order?: number,
}