const builtin = @import("builtin");
const std = @import("std");

const Engine = @import("Engine.zig").Engine;

// Force allocator to use c allocator for emscripten
pub const os = if (builtin.os.tag != .wasi) std.os else struct {
    pub const heap = struct {
        pub const page_allocator = std.heap.c_allocator;
    };
};

pub const std_options: std.Options = .{ .wasiCwd = if (builtin.os.tag == .wasi) defaultWasiCwd else std.fs.defaultWasiCwd };
var default_wasi_dir = if (builtin.os.tag == .wasi) std.fs.defaultWasiCwd() else void;
pub fn defaultWasiCwd() std.os.wasi.fd_t {
    // Expect the first preopen to be current working directory.
    return default_wasi_dir;
}

var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
const allocator = arena.allocator();

var engine: Engine = undefined;

export fn emscripten_return_address() void {}

pub fn main() !void {
    if (builtin.os.tag == .wasi) {
        const dir = try std.fs.cwd().openDir("/wasm_data", .{});
        default_wasi_dir = dir.fd;
    }

    engine = try Engine.init(allocator);

    if (!builtin.target.isWasm()) {
        defer engine.deinit();
        try engine.run();
    }
}

pub export fn tick() bool {
    engine.running = true;
    engine.tick() catch {
        engine.running = false;
    };

    return engine.running;
}
