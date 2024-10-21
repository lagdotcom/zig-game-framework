const std = @import("std");
const sdl = @import("sdl.zig").sdl;

pub const Texture = struct {
    renderer: ?*sdl.SDL_Renderer,
    texture: [*c]sdl.SDL_Texture,
    width: c_int,
    height: c_int,

    pub fn load_from_file(renderer: ?*sdl.SDL_Renderer, path: [*c]const u8) !Texture {
        const surface = sdl.IMG_Load(path);
        if (surface == null) {
            std.debug.print("IMG_Load: {s}\n", .{sdl.SDL_GetError()});
            return error.IMG_Load;
        }
        defer sdl.SDL_DestroySurface(surface);

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
            .width = surface.*.w,
            .height = surface.*.h,
        };
    }

    pub fn load_from_text(renderer: ?*sdl.SDL_Renderer, font: ?*sdl.TTF_Font, text: [*c]const u8, colour: sdl.SDL_Color) !Texture {
        const surface = sdl.TTF_RenderText_Blended(font, text, 0, colour);
        if (surface == null) {
            std.debug.print("TTF_RenderText_Blended: {s}\n", .{sdl.SDL_GetError()});
            return error.IMG_Load;
        }
        defer sdl.SDL_DestroySurface(surface);

        const texture = sdl.SDL_CreateTextureFromSurface(renderer, surface);
        if (texture == null) {
            std.debug.print("SDL_CreateTextureFromSurface: {s}", .{sdl.SDL_GetError()});
            return error.SDL_CreateTextureFromSurface;
        }

        return Texture{
            .renderer = renderer,
            .texture = texture,
            .width = surface.*.w,
            .height = surface.*.h,
        };
    }

    pub fn deinit(self: *Texture) void {
        sdl.SDL_DestroyTexture(self.texture);
    }

    pub fn set_color(self: *Texture, r: u8, g: u8, b: u8) void {
        _ = sdl.SDL_SetTextureColorMod(self.texture, r, g, b);
    }

    pub fn set_alpha(self: *Texture, a: u8) void {
        _ = sdl.SDL_SetTextureAlphaMod(self.texture, a);
    }

    pub fn set_blending(self: *Texture, mode: sdl.SDL_BlendMode) void {
        _ = sdl.SDL_SetTextureBlendMode(self.texture, mode);
    }

    inline fn get_destination_rect(self: *Texture, x: f32, y: f32) sdl.SDL_FRect {
        return sdl.SDL_FRect{
            .x = x,
            .y = y,
            .w = @floatFromInt(self.width),
            .h = @floatFromInt(self.height),
        };
    }

    pub fn render(self: *Texture, x: f32, y: f32) void {
        var dest = self.get_destination_rect(x, y);
        _ = sdl.SDL_RenderTexture(self.renderer, self.texture, null, &dest);
    }

    pub fn render_clipped(self: *Texture, x: f32, y: f32, clip: *sdl.SDL_FRect, width: f32, height: f32) void {
        var dest = self.get_destination_rect(x, y);

        // default to clipping rectangle
        if (clip != null) {
            dest.w = clip.w;
            dest.h = clip.h;
        }

        // use sizes if given
        if (width > 0) dest.w = width;
        if (height > 0) dest.h = height;

        _ = sdl.SDL_RenderTexture(self.renderer, self.texture, clip, &dest);
    }

    pub fn render_clipped_rotated(self: *Texture, x: f32, y: f32, clip: *sdl.SDL_FRect, width: f32, height: f32, angle: f64, centre: *sdl.SDL_FPoint, flip: sdl.SDL_FlipMode) void {
        var dest = self.get_destination_rect(x, y);

        // default to clipping rectangle
        if (clip != null) {
            dest.w = clip.w;
            dest.h = clip.h;
        }

        // use sizes if given
        if (width > 0) dest.w = width;
        if (height > 0) dest.h = height;

        _ = sdl.SDL_RenderTextureRotated(self.renderer, self.texture, clip, dest, angle, centre, flip);
    }
};
