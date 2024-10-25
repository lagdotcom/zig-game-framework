const std = @import("std");
const sdl = @import("sdl.zig").sdl;

const oc = @import("cards/other.zig");
const r = @import("rendering.zig");

pub const Engine = struct {
    allocator: std.mem.Allocator,
    running: bool,
    window: ?*sdl.SDL_Window,
    bundle: r.RenderingBundle,
    mouse_x: f32,
    mouse_y: f32,

    pub fn init(allocator: std.mem.Allocator) !Engine {
        if (!sdl.SDL_SetAppMetadata("Space Colony TCG", "0.1.0", "com.sadfolks.spacecolonytcg"))
            std.log.debug("SDL_SetAppMetadata: {s}", .{sdl.SDL_GetError()});
        if (!sdl.SDL_SetAppMetadataProperty(sdl.SDL_PROP_APP_METADATA_CREATOR_STRING, "Sad Folks Interactive"))
            std.log.debug("SDL_SetAppMetadataProperty creator: {s}", .{sdl.SDL_GetError()});
        if (!sdl.SDL_SetAppMetadataProperty(sdl.SDL_PROP_APP_METADATA_TYPE_STRING, "game"))
            std.log.debug("SDL_SetAppMetadataProperty type: {s}", .{sdl.SDL_GetError()});

        if (!sdl.SDL_Init(sdl.SDL_INIT_VIDEO)) {
            std.log.debug("SDL_Init: {s}\n", .{sdl.SDL_GetError()});
            return error.SDL_Init;
        }
        errdefer sdl.SDL_Quit();

        const window = sdl.SDL_CreateWindow("Zig + SDL3", r.window_width, r.window_height, 0);
        if (window == null) {
            std.log.debug("SDL_CreateWindow: {s}\n", .{sdl.SDL_GetError()});
            return error.SDL_CreateWindow;
        }
        errdefer sdl.SDL_DestroyWindow(window);

        const bundle = try r.RenderingBundle.init(window);

        return Engine{
            .allocator = allocator,
            .window = window,
            .bundle = bundle,
            .mouse_x = -1,
            .mouse_y = -1,
            .running = false,
        };
    }

    pub fn deinit(self: *Engine) void {
        self.bundle.deinit();
        sdl.SDL_DestroyWindow(self.window);
        sdl.SDL_Quit();
    }

    pub fn run(self: *Engine) !void {
        self.running = true;
        while (self.running) try self.tick();
    }

    pub fn tick(self: *Engine) !void {
        var e: sdl.SDL_Event = undefined;
        while (sdl.SDL_PollEvent(&e)) {
            if (e.type == sdl.SDL_EVENT_QUIT) {
                self.running = false;
                return;
            } else if (e.type == sdl.SDL_EVENT_MOUSE_MOTION) {
                self.mouse_x = e.motion.x;
                self.mouse_y = e.motion.y;
            }
        }

        _ = sdl.SDL_SetRenderDrawColor(self.bundle.renderer, 0xff, 0xff, 0xff, 0xff);
        _ = sdl.SDL_RenderClear(self.bundle.renderer);

        inline for (0..9) |cn| {
            try self.bundle.render_card(300 + (cn / 3) * 160, 10 + (cn % 3) * 160, oc.others[cn]);
        }

        _ = sdl.SDL_RenderPresent(self.bundle.renderer);
    }
};
