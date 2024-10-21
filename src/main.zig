const builtin = @import("builtin");
const std = @import("std");

const Engine = @import("Engine.zig").Engine;

var engine: Engine = undefined;

pub fn main() !void {
    engine = try Engine.init();

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
