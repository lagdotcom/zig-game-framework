import { Pixels } from "../flavours";
import decomposeFlags from "../utils/decomposeFlags";
import { SDL_WindowID } from "./flavours";
import SDL_Event, { SDL_MouseMotionEvent } from "./SDL_Event";
import SDL_EventType from "./SDL_EventType";
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
    public events: SDL_Event[],
  ) {
    this.id = SDL_Window.nextId++;

    surface.refcount++;
    surface.canvas.width = width;
    surface.canvas.height = height;
    document.body.append(surface.canvas);

    surface.canvas.addEventListener("mousemove", this.onMouseMove);

    console.log("SDL_Window", decomposeFlags(flags, SDL_WindowFlags));
  }

  destroy() {
    this.surface.destroy();
    this.surface.canvas.removeEventListener("mousemove", this.onMouseMove);
    this.surface.canvas.remove();
  }

  onMouseMove = (e: MouseEvent) => {
    this.events.push(
      new SDL_MouseMotionEvent(
        SDL_EventType.SDL_EVENT_MOUSE_MOTION,
        this.id,
        0,
        0,
        e.offsetX,
        e.offsetY,
        e.movementX,
        e.movementY,
      ),
    );
  };
}
