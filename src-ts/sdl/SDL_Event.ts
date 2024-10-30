import { Nanoseconds } from "../flavours";
import makeStructViewer, {
  bool,
  cast,
  f32,
  int,
  u16,
  u32,
  u64,
} from "../makeStructViewer";
import getNanosecondTimestamp from "../utils/getNanosecondTimestamp";
import {
  SDL_EventPtr,
  SDL_KeyboardID,
  SDL_MouseID,
  SDL_WindowID,
} from "./flavours";
import SDL_EventType from "./SDL_EventType";
import SDL_Keycode from "./SDL_Keycode";
import SDL_Keymod from "./SDL_Keymod";
import SDL_MouseButtonFlags from "./SDL_MouseButtonFlags";
import SDL_Scancode from "./SDL_Scancode";

/* typedef struct SDL_KeyboardEvent {
    SDL_EventType type;     // SDL_EVENT_KEY_DOWN or SDL_EVENT_KEY_UP
    Uint32 reserved;
    Uint64 timestamp;       // In nanoseconds, populated using SDL_GetTicksNS()
    SDL_WindowID windowID;  // The window with keyboard focus, if any
    SDL_KeyboardID which;   // The keyboard instance id, or 0 if unknown or virtual
    SDL_Scancode scancode;  // SDL physical key code
    SDL_Keycode key;        // SDL virtual key code
    SDL_Keymod mod;         // current key modifiers
    Uint16 raw;             // The platform dependent scancode for this event
    bool down;              // true if the key is pressed
    bool repeat;            // true if this is a key repeat
} SDL_KeyboardEvent; */
const getKeyboardEventView = makeStructViewer({
  type: cast<SDL_EventType>(int),
  reserved: u32,
  timestamp: u64,
  windowID: cast<SDL_WindowID>(int),
  which: cast<SDL_KeyboardID>(int),
  scancode: cast<SDL_Scancode>(int),
  key: cast<SDL_Keycode>(int),
  mod: cast<SDL_Keymod>(int),
  raw: u16,
  down: bool,
  repeat: bool,
});

export class SDL_KeyboardEvent {
  timestamp: Nanoseconds;

  constructor(
    public type:
      | SDL_EventType.SDL_EVENT_KEY_UP
      | SDL_EventType.SDL_EVENT_KEY_DOWN,
    public windowID: SDL_WindowID,
    public which: SDL_KeyboardID,
    public scancode: SDL_Scancode,
    public key: SDL_Keycode,
    public mod: SDL_Keymod,
    public raw: number,
    public down: boolean,
    public repeat: boolean,
  ) {
    this.timestamp = getNanosecondTimestamp();
  }

  write(mem: WebAssembly.Memory, ptr: SDL_EventPtr) {
    const view = getKeyboardEventView(mem.buffer, ptr);
    view.type = this.type;
    view.reserved = 0;
    view.timestamp = this.timestamp;
    view.windowID = this.windowID;
    view.which = this.which;
    view.scancode = this.scancode;
    view.key = this.key;
    view.mod = this.mod;
    view.raw = this.raw;
    view.down = this.down;
    view.repeat = this.repeat;
  }
}

/* typedef struct SDL_MouseMotionEvent {
    SDL_EventType type; // SDL_EVENT_MOUSE_MOTION
    Uint32 reserved;
    Uint64 timestamp;   // In nanoseconds, populated using SDL_GetTicksNS()
    SDL_WindowID windowID; // The window with mouse focus, if any
    SDL_MouseID which;  // The mouse instance id or SDL_TOUCH_MOUSEID
    SDL_MouseButtonFlags state;       // The current button state
    float x;            // X coordinate, relative to window
    float y;            // Y coordinate, relative to window
    float xrel;         // The relative motion in the X direction
    float yrel;         // The relative motion in the Y direction
} SDL_MouseMotionEvent; */
const getMouseMotionEventView = makeStructViewer({
  type: cast<SDL_EventType>(int),
  reserved: u32,
  timestamp: u64,
  windowID: cast<SDL_WindowID>(int),
  which: cast<SDL_MouseID>(int),
  state: cast<SDL_MouseButtonFlags>(int),
  x: f32,
  y: f32,
  xrel: f32,
  yrel: f32,
});

export class SDL_MouseMotionEvent {
  timestamp: Nanoseconds;

  constructor(
    public type: SDL_EventType.SDL_EVENT_MOUSE_MOTION,
    public windowID: SDL_WindowID,
    public which: SDL_MouseID,
    public state: SDL_MouseButtonFlags,
    public x: number,
    public y: number,
    public xrel: number,
    public yrel: number,
  ) {
    this.timestamp = getNanosecondTimestamp();
  }

  write(mem: WebAssembly.Memory, ptr: SDL_EventPtr) {
    const view = getMouseMotionEventView(mem.buffer, ptr);
    view.type = this.type;
    view.reserved = 0;
    view.timestamp = this.timestamp;
    view.windowID = this.windowID;
    view.which = this.which;
    view.state = this.state;
    view.x = this.x;
    view.y = this.y;
    view.xrel = this.xrel;
    view.yrel = this.yrel;
  }
}

type SDL_Event = SDL_KeyboardEvent | SDL_MouseMotionEvent;
export default SDL_Event;
