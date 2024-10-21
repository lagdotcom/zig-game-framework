import { Pixels } from "../flavours";

export default function makeCanvas(width: Pixels, height: Pixels) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("could not get 2d context");

  return { canvas, ctx };
}

export function makeOffscreenCanvas(width: Pixels, height: Pixels) {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("could not get 2d context");

  return { canvas, ctx };
}
