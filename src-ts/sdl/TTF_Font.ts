import { TTF_FontID } from "./flavours";

export default class TTF_Font {
  static nextId: TTF_FontID = 1;

  id: TTF_FontID;

  constructor(
    public face: string,
    public size: number,
  ) {
    this.id = TTF_Font.nextId++;
  }

  get font() {
    return `${this.size}pt ${this.face}`;
  }
}
