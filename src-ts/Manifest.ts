import { UrlString } from "./flavours";

interface ImageRef {
  type: "image";
  url: UrlString;
}
export const img = (url: UrlString): ImageRef => ({ type: "image", url });

export type ResourceRef = ImageRef;

export default interface Manifest {
  url: UrlString;
  resources: Record<string, ResourceRef>;
}

export interface ImageResource {
  type: "image";
  path: string;
  img: HTMLImageElement;
}

export type Resource = ImageResource;

export type ResourceMap = Record<string, Resource>;

async function fetchImage(path: string, ref: ImageRef): Promise<ImageResource> {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    img.src = ref.url;
    img.addEventListener("load", () => resolve({ type: "image", path, img }));
  });
}

export async function fetchManifest(
  m: Manifest,
): Promise<[wasmPromise: Response, resource: ResourceMap]> {
  const wasmPromise = fetch(m.url);
  const promises = [];
  const resources: ResourceMap = {};

  for (const [path, ref] of Object.entries(m.resources)) {
    switch (ref.type) {
      case "image": {
        promises.push(
          fetchImage(path, ref).then((res) => (resources[path] = res)),
        );
        break;
      }
    }
  }

  const [wasmResource] = await Promise.all([wasmPromise, ...promises]);
  return [wasmResource, resources];
}
