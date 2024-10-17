const std = @import("std");
const sdl = @cImport({
    @cInclude("SDL3/SDL_image.h");
});

const window_width = 800;
const window_height = 600;

pub const Engine = extern struct {
    window: *sdl.SDL_Window,
    renderer: *sdl.SDL_Renderer,
    bg_texture: *sdl.SDL_Texture,
    running: bool,

    pub fn init() !Engine {
        if (!sdl.SDL_Init(sdl.SDL_INIT_VIDEO)) {
            std.debug.print("SDL_Init: {s}\n", .{sdl.SDL_GetError()});
            return error.SDL_Init;
        }
        errdefer sdl.SDL_Quit();

        const window = sdl.SDL_CreateWindow("Zig + SDL3", window_width, window_height, 0);
        if (window == null) {
            std.debug.print("SDL_CreateWindow: {s}\n", .{sdl.SDL_GetError()});
            return error.SDL_CreateWindow;
        }
        errdefer sdl.SDL_DestroyWindow(window);

        const renderer = sdl.SDL_CreateRenderer(window, null);
        if (renderer == null) {
            std.debug.print("SDL_CreateRenderer: {s}\n", .{sdl.SDL_GetError()});
            return error.SDL_CreateRenderer;
        }
        errdefer sdl.SDL_DestroyRenderer(renderer);

        const desired = sdl.IMG_INIT_PNG;
        const loaded = sdl.IMG_Init(desired);
        if ((loaded & desired) != desired) {
            std.log.debug("IMG_Init: {s}", .{sdl.SDL_GetError()});
            return error.IMG_Init;
        }
        errdefer sdl.IMG_Quit();

        const bg_image = sdl.IMG_Load("res/png.png");
        if (bg_image == null) {
            std.debug.print("IMG_Load: {s}\n", .{sdl.SDL_GetError()});
            return error.IMG_Load;
        }

        const bg_texture = sdl.SDL_CreateTextureFromSurface(renderer, bg_image);
        if (bg_texture == null) {
            sdl.SDL_DestroySurface(bg_image);

            std.debug.print("SDL_CreateTextureFromSurface: {s}", .{sdl.SDL_GetError()});
            return error.SDL_CreateTextureFromSurface;
        }
        sdl.SDL_DestroySurface(bg_image);
        errdefer sdl.SDL_DestroyTexture(bg_texture);

        return Engine{
            .window = window.?,
            .renderer = renderer.?,
            .bg_texture = bg_texture,
            .running = false,
        };
    }

    pub fn deinit(self: *Engine) void {
        sdl.SDL_DestroyTexture(self.bg_texture);
        sdl.SDL_DestroyRenderer(self.renderer);
        sdl.SDL_DestroyWindow(self.window);
        sdl.IMG_Quit();
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

        _ = sdl.SDL_SetRenderDrawColor(self.renderer, 0xff, 0xff, 0x7f, 0xff);
        _ = sdl.SDL_RenderClear(self.renderer);

        const rect = sdl.SDL_FRect{
            .w = @floatFromInt(self.bg_texture.w),
            .h = @floatFromInt(self.bg_texture.h),
            .x = @as(f32, @floatFromInt(window_width - self.bg_texture.w)) / 2,
            .y = @as(f32, @floatFromInt(window_height - self.bg_texture.h)) / 2,
        };
        _ = sdl.SDL_RenderTexture(self.renderer, self.bg_texture, null, &rect);

        _ = sdl.SDL_RenderPresent(self.renderer);
    }
};
