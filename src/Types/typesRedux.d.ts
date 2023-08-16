interface RootState {
  data: DataState,
  auth: AuthState
}

interface DataState {
  pages: Array<Page> | null,
  sheets: Array<Sheet> | null,
  notes: Array<Note> | null,
  toast: React.MutableRefObject<null> | null,
  selectedNode: childNode
}

interface AuthState {
  userId: array | null,
  token: string | null,
  isConnected: boolean,
  header: any
}