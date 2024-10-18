import { RGBAValue } from "../flavours";
import { extractRGBA } from "./rgba";

const convertCanvasToBitmap =
  (key?: RGBAValue) => (canvas: HTMLCanvasElement) => {
    if (!key) return window.createImageBitmap(canvas);

    const col = extractRGBA(key);

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get context");

    const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < id.data.length; i += 4) {
      if (
        id.data[i] === col.r &&
        id.data[i + 1] === col.g &&
        id.data[i + 2] === col.b
      )
        id.data[i + 3] = 0;
    }

    return window.createImageBitmap(id);
  };
export default convertCanvasToBitmap;
