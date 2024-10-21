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

import { Nanoseconds } from "../flavours";
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
    const view = new DataView(mem.buffer, ptr);

    view.setUint32(0, this.type, true);
    view.setUint32(4, 0, true);
    view.setBigUint64(8, this.timestamp, true);
    view.setUint32(16, this.windowID, true);
    view.setUint32(20, this.which, true);
    view.setUint32(24, this.scancode, true);
    view.setUint32(28, this.key, true);
    view.setUint32(32, this.mod, true);
    view.setUint16(36, this.raw, true);
    view.setUint8(38, this.down ? 1 : 0);
    view.setUint8(39, this.repeat ? 1 : 0);
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
    const view = new DataView(mem.buffer, ptr);

    view.setUint32(0, this.type, true);
    view.setUint32(4, 0, true);
    view.setBigUint64(8, this.timestamp, true);
    view.setUint32(16, this.windowID, true);
    view.setUint32(20, this.which, true);
    view.setUint32(24, this.state, true);
    view.setFloat32(28, this.x, true);
    view.setFloat32(32, this.y, true);
    view.setFloat32(36, this.xrel, true);
    view.setFloat32(40, this.xrel, true);
  }
}

type SDL_Event = SDL_KeyboardEvent | SDL_MouseMotionEvent;
export default SDL_Event;
