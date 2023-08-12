interface RootState {
  data: DataState;
}

interface DataState {
  pages: Array<Page> | null;
  sheets: Array<Sheet> | null;
  notes: Array<Note> | null;
  toast: React.MutableRefObject<null> | null
  selectedNode: childNode
}