export interface chat {
  id: string
  conversation: message[]
}

export interface message {
  emisor: string,
  receptor: string,
  mensaje: string
}