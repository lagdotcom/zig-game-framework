import SDL_Surface from "../sdl/SDL_Surface";
import { makeOffscreenCanvas } from "./makeCanvas";
import { extractRGBA } from "./rgba";

export default function convertSurfaceToCanvas(surface: SDL_Surface) {
  const { canvas, ctx } = makeOffscreenCanvas(
    surface.canvas.width,
    surface.canvas.height,
  );

  if (typeof surface.colorKey === "number") {
    // this function is hella slow, avoid when possible
    const id = surface.ctx.getImageData(0, 0, canvas.width, canvas.height);
    const col = extractRGBA(surface.colorKey);

    for (let i = 0; i < id.data.length; i += 4) {
      if (
        id.data[i] === col.r &&
        id.data[i + 1] === col.g &&
        id.data[i + 2] === col.b
      )
        id.data[i + 3] = 0;
    }

    ctx.putImageData(id, 0, 0);
  } else ctx.drawImage(surface.canvas, 0, 0);

  return canvas;
}
