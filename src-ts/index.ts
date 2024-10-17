import wasmUrl from "../zig-out/bin/game.wasm";
import Env, { EngineExports } from "./Env";

async function main() {
  const env = new Env();
  const src = await WebAssembly.instantiateStreaming(fetch(wasmUrl), {
    env: env as unknown as WebAssembly.ModuleImports,
  });
  env.start(src.instance.exports as unknown as EngineExports);
}

window.addEventListener("load", main);
