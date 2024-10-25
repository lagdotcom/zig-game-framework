import { Pixels } from "./flavours";
import TTF_Font from "./sdl/TTF_Font";
import makeCanvas from "./utils/makeCanvas";

export interface Size {
  width: Pixels;
  height: Pixels;
}

type WrappingKey = `${string}|${string}|${number}`;
function getWrappingKey(
  font: TTF_Font,
  text: string,
  wrapWidth: number,
): WrappingKey {
  return `${font.id}|${text}|${wrapWidth}`;
}

interface WrappingData {
  lines: string[];
  size: Size;
}

export default class WordWrapper {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  wrappings: Map<WrappingKey, WrappingData>;

  constructor() {
    const { canvas, ctx } = makeCanvas(0, 0);
    this.canvas = canvas;
    this.ctx = ctx;

    this.wrappings = new Map();
  }

  private measureText(font: TTF_Font, text: string) {
    this.ctx.font = font.font;
    const metrics = this.ctx.measureText(text);
    const size: Size = {
      width: Math.max(
        metrics.width,
        metrics.actualBoundingBoxRight + metrics.actualBoundingBoxLeft,
      ),
      height: metrics.fontBoundingBoxDescent + metrics.fontBoundingBoxAscent,
    };

    return size;
  }

  measure(font: TTF_Font, text: string, wrapWidth: number) {
    if (!wrapWidth)
      return { lines: [text], size: this.measureText(font, text) };

    const key = getWrappingKey(font, text, wrapWidth);
    const data = this.wrappings.get(key);
    if (data) return data;

    const lines: string[] = [];
    const lineSoFar: string[] = [];
    for (const line of text.split("\n")) {
      for (const word of line.split(" ")) {
        const lineTest = lineSoFar.concat(word).join(" ");
        const size = this.measureText(font, lineTest);
        if (size.width > wrapWidth) {
          if (!lineSoFar.length) lines.push(lineTest);
          else {
            lines.push(lineSoFar.join(" "));
            lineSoFar.splice(0, Infinity, word);
          }
        } else lineSoFar.push(word);
      }

      if (lineSoFar.length) {
        lines.push(lineSoFar.join(" "));
        lineSoFar.splice(0, Infinity);
      }
    }

    const longest = lines
      .map((line) => this.measureText(font, line))
      .reduce((a, b) => (a.width > b.width ? a : b));

    const size: Size = {
      width: longest.width,
      height: longest.height * lines.length,
    };

    this.wrappings.set(key, { lines, size });
    return { lines, size };
  }
}
