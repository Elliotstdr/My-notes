interface childNode {
  id?: string,
  label?: string,
  data?: string,
  children?: any,
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