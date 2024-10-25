import { FontName, Pixels } from "../flavours";
import { TTF_FontID } from "./flavours";

export default class TTF_Font {
  static nextId: TTF_FontID = 1;

  id: TTF_FontID;

  constructor(
    public face: FontName,
    public size: Pixels,
  ) {
    this.id = TTF_Font.nextId++;
  }

  get font() {
    return `${this.size}px ${this.face}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  destroy() {}
}
