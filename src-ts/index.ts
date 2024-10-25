import wasmUrl from "../zig-out/bin/game.wasm";
import Env, { EngineExports } from "./Env";
import Manifest, { fetchManifest } from "./Manifest";

const manifest: Manifest = {
  url: wasmUrl,
  resources: {},
};

async function main() {
  const [wasmPromise, resources] = await fetchManifest(manifest);
  const env = new Env(resources, {
    "C:\\Windows\\Fonts\\baskvill.ttf": "Baskerville Old Face Regular",
  });
  const src = await WebAssembly.instantiateStreaming(wasmPromise, {
    env: env as unknown as WebAssembly.ModuleImports,
  });
  env.start(src.instance.exports as unknown as EngineExports);
}
window.addEventListener("load", main);
