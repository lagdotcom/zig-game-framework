const sdl = @import("sdl.zig").sdl;

pub inline fn rect(x: i32, y: i32, w: i32, h: i32) sdl.SDL_Rect {
    return sdl.SDL_Rect{ .x = x, .y = y, .w = w, .h = h };
}

pub inline fn frect(x: f32, y: f32, w: f32, h: f32) sdl.SDL_FRect {
    return sdl.SDL_FRect{ .x = x, .y = y, .w = w, .h = h };
}

pub inline fn rgb(r: u8, g: u8, b: u8) sdl.SDL_Color {
    return sdl.SDL_Color{ .r = r, .g = g, .b = b, .a = 255 };
}
