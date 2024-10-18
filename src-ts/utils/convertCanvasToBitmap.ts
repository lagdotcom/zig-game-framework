import SDL_Surface from "../sdl/SDL_Surface";
import { extractRGBA } from "./rgba";

export default function convertCanvasToBitmap(surface: SDL_Surface) {
  const id = surface.ctx.getImageData(0, 0, surface.width, surface.height);

  if (typeof surface.colorKey === "number") {
    const col = extractRGBA(surface.colorKey);

    for (let i = 0; i < id.data.length; i += 4) {
      if (
        id.data[i] === col.r &&
        id.data[i + 1] === col.g &&
        id.data[i + 2] === col.b
      )
        id.data[i + 3] = 0;
    }
  }

  return window.createImageBitmap(id);
}
