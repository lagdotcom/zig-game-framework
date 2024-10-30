import { Pixels } from "../flavours";
import makeStructViewer, { cast, i32 } from "../makeStructViewer";
import { SDL_RectPtr } from "./flavours";

const getView = makeStructViewer({
  x: cast<Pixels>(i32),
  y: cast<Pixels>(i32),
  w: cast<Pixels>(i32),
  h: cast<Pixels>(i32),
});

export default class SDL_Rect {
  constructor(
    public x: Pixels,
    public y: Pixels,
    public w: Pixels,
    public h: Pixels,
  ) {}

  static fromPointer(buffer: ArrayBuffer, offset: SDL_RectPtr) {
    const data = getView(buffer, offset);
    return new SDL_Rect(data.x, data.y, data.w, data.h);
  }
}
