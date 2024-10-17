import { Pixels, Ptr, SDL_WindowID } from "./flavours";
import SDL_Surface from "./SDL_Surface";

export default class SDL_Window {
  static nextId: SDL_WindowID = 1;

  id: SDL_WindowID;
  surface: Ptr;

  constructor(
    surface: SDL_Surface,
    public title: string,
    public width: Pixels,
    public height: Pixels,
    public flags: number,
  ) {
    this.id = SDL_Window.nextId++;
    this.surface = surface.id;

    surface.canvas.width = width;
    surface.canvas.height = height;
    document.body.append(surface.canvas);
  }
}
