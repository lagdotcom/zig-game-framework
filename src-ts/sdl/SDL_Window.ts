import { Pixels } from "../flavours";
import decomposeFlags from "../utils/decomposeFlags";
import { SDL_WindowID } from "./flavours";
import SDL_Surface from "./SDL_Surface";
import SDL_WindowFlags from "./SDL_WindowFlags";

export default class SDL_Window {
  static nextId: SDL_WindowID = 1;

  id: SDL_WindowID;

  constructor(
    public surface: SDL_Surface,
    public title: string,
    public width: Pixels,
    public height: Pixels,
    public flags: SDL_WindowFlags,
  ) {
    this.id = SDL_Window.nextId++;

    surface.canvas.width = width;
    surface.canvas.height = height;
    document.body.append(surface.canvas);

    console.log("SDL_Window", decomposeFlags(flags, SDL_WindowFlags));
  }
}
