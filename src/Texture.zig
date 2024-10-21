const std = @import("std");
const sdl = @cImport({
    @cInclude("SDL3/SDL_image.h");
});
pub const Texture = struct {
    renderer: *sdl.SDL_Renderer,
    texture: [*c]sdl.SDL_Texture,
    width: c_int,
    height: c_int,

    pub fn load_from_file(renderer: *sdl.SDL_Renderer, path: [*c]const u8) !Texture {
        const surface = sdl.IMG_Load(path);
        if (surface == null) {
            std.debug.print("IMG_Load: {s}\n", .{sdl.SDL_GetError()});
            return error.IMG_Load;
        }
        defer sdl.SDL_DestroySurface(surface);

        const width = surface.*.w;
        const height = surface.*.h;

        if (!sdl.SDL_SetSurfaceColorKey(surface, true, sdl.SDL_MapSurfaceRGB(surface, 0, 0xff, 0xff))) {
            std.debug.print("SDL_SetSurfaceColorKey: {s}", .{sdl.SDL_GetError()});
            return error.SDL_SetSurfaceColorKey;
        }

        const texture = sdl.SDL_CreateTextureFromSurface(renderer, surface);
        if (texture == null) {
            std.debug.print("SDL_CreateTextureFromSurface: {s}", .{sdl.SDL_GetError()});
            return error.SDL_CreateTextureFromSurface;
        }

        return Texture{
            .renderer = renderer,
            .texture = texture,
            .width = width,
            .height = height,
        };
    }

    pub fn deinit(self: *Texture) void {
        sdl.SDL_DestroyTexture(self.texture);
    }

    pub fn render(self: *Texture, x: f32, y: f32) void {
        var dest = sdl.SDL_FRect{
            .x = x,
            .y = y,
            .w = @floatFromInt(self.width),
            .h = @floatFromInt(self.height),
        };

        _ = sdl.SDL_RenderTexture(self.renderer, self.texture, null, &dest);
    }
};
