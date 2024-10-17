const std = @import("std");
const sdl = @cImport({
    @cInclude("SDL3/SDL.h");
});

pub const Engine = extern struct {
    window: *sdl.SDL_Window,
    surface: *sdl.SDL_Surface,
    bg_image: *sdl.SDL_Surface,
    running: bool,

    pub fn init() !Engine {
        if (!sdl.SDL_Init(sdl.SDL_INIT_VIDEO)) {
            std.debug.print("SDL_Init: {s}\n", .{sdl.SDL_GetError()});
            return error.Init;
        }

        const window = sdl.SDL_CreateWindow("Zig + SDL3", 800, 600, 0);
        if (window == null) {
            std.debug.print("SDL_CreateWindow: {s}\n", .{sdl.SDL_GetError()});
            return error.CreateWindow;
        }
        const surface = sdl.SDL_GetWindowSurface(window);

        const bg_image = sdl.SDL_LoadBMP("res/hi.bmp");
        if (bg_image == null) {
            std.debug.print("SDL_LoadBMP: {s}\n", .{sdl.SDL_GetError()});
            return error.LoadBMP;
        }

        return Engine{ .window = window.?, .surface = surface, .bg_image = bg_image, .running = false };
    }

    pub fn deinit(self: *Engine) void {
        sdl.SDL_DestroySurface(self.bg_image);
        sdl.SDL_DestroyWindow(self.window);
        sdl.SDL_Quit();
    }

    pub fn run(self: *Engine) void {
        self.running = true;
        while (self.running) self.tick();
    }

    pub fn tick(self: *Engine) void {
        var event: sdl.SDL_Event = undefined;
        while (sdl.SDL_PollEvent(&event)) {
            if (event.type == sdl.SDL_EVENT_QUIT) {
                self.running = false;
                return;
            }
        }

        const cx = @divFloor(self.surface.w - self.bg_image.w, 2);
        const cy = @divFloor(self.surface.h - self.bg_image.h, 2);
        const rect = sdl.SDL_Rect{ .w = self.bg_image.w, .h = self.bg_image.h, .x = cx, .y = cy };

        _ = sdl.SDL_BlitSurface(self.bg_image, null, self.surface, &rect);
        _ = sdl.SDL_UpdateWindowSurface(self.window);
    }
};
