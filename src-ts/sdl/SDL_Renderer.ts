import { makeOffscreenCanvas } from "../utils/makeCanvas";
import { SDL_RendererID } from "./flavours";
import SDL_FRect from "./SDL_FRect";
import SDL_Rect from "./SDL_Rect";
import SDL_Texture from "./SDL_Texture";
import SDL_Window from "./SDL_Window";

export default class SDL_Renderer {
  static nextId: SDL_RendererID = 1;

  id: SDL_RendererID;
  drawColor: string;
  canvas: OffscreenCanvas;
  ctx: OffscreenCanvasRenderingContext2D;
  clip?: SDL_Rect;

  constructor(private window: SDL_Window) {
    this.id = SDL_Renderer.nextId++;
    this.drawColor = "black";

    const { canvas, ctx } = makeOffscreenCanvas(window.width, window.height);
    this.canvas = canvas;
    this.ctx = ctx;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  destroy() {}

  get rect() {
    return new SDL_Rect(0, 0, this.canvas.width, this.canvas.height);
  }

  clear() {
    // yes, this ignores clipping
    this.ctx.fillStyle = this.drawColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    return true;
  }

  present() {
    this.window.surface.ctx.drawImage(this.canvas, 0, 0);
    return true;
  }

  private save() {
    this.ctx.save();
    if (this.clip) {
      const path = new Path2D();
      path.rect(this.clip.x, this.clip.y, this.clip.w + 1, this.clip.h + 1);

      this.ctx.clip(path);
    }
  }

  private restore() {
    this.ctx.restore();
    return true;
  }

  fill(rect: SDL_FRect) {
    this.save();
    this.ctx.fillStyle = this.drawColor;
    this.ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    return this.restore();
  }

  render(t: SDL_Texture, s: SDL_FRect, d: SDL_FRect) {
    this.save();
    this.ctx.drawImage(t.canvas, s.x, s.y, s.w, s.h, d.x, d.y, d.w, d.h);
    return this.restore();
  }
}
