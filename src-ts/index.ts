import backgroundPng from "../res/background.png";
import charPng from "../res/char.png";
import wasmUrl from "../zig-out/bin/game.wasm";
import Env, { EngineExports } from "./Env";
import Manifest, { fetchManifest, img } from "./Manifest";

const manifest: Manifest = {
  url: wasmUrl,
  resources: {
    "res/background.png": img(backgroundPng),
    "res/char.png": img(charPng),
  },
};

async function main() {
  const [wasmPromise, resources] = await fetchManifest(manifest);
  const env = new Env(resources);
  const src = await WebAssembly.instantiateStreaming(wasmPromise, {
    env: env as unknown as WebAssembly.ModuleImports,
  });
  env.start(src.instance.exports as unknown as EngineExports);
}
window.addEventListener("load", main);
