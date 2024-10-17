declare module "*.wasm" {
  const url: import("./flavours").UrlString;
  export default url;
}

declare module "*.bmp" {
  const url: import("./flavours").UrlString;
  export default url;
}
