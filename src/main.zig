const builtin = @import("builtin");
const std = @import("std");

const Engine = @import("Engine.zig").Engine;

extern fn setEngineAddress(engine: *Engine) void;

pub fn main() !void {
    var engine = try Engine.init();

    if (builtin.target.isWasm()) {
        setEngineAddress(&engine);
    } else {
        defer engine.deinit();
        engine.run();
    }
}

pub export fn tick(engine: *Engine) bool {
    engine.running = true;
    engine.tick();

    return engine.running;
}
