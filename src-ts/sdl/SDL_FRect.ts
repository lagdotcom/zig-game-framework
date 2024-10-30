import { Pixels } from "../flavours";
import makeStructViewer, { f32 } from "../makeStructViewer";
import { SDL_FRectPtr } from "./flavours";

const getView = makeStructViewer({
  x: f32,
  y: f32,
  w: f32,
  h: f32,
});

export default class SDL_FRect {
  constructor(
    public x: Pixels,
    public y: Pixels,
    public w: Pixels,
    public h: Pixels,
  ) {}

  static fromPointer(buffer: ArrayBuffer, offset: SDL_FRectPtr) {
    const data = getView(buffer, offset);
    return new SDL_FRect(data.x, data.y, data.w, data.h);
  }
}
