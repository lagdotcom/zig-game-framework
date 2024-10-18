import backgroundPng from "../res/background.png";
import charPng from "../res/char.png";
import { Pixels, UrlString } from "./flavours";

interface ImageResource {
  url: UrlString;
  width: Pixels;
  height: Pixels;
}

export const images: Record<string, ImageResource> = {
  "res/background.png": { url: backgroundPng, width: 640, height: 480 },
  "res/char.png": { url: charPng, width: 64, height: 128 },
};
