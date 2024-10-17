import { Bytes, Ptr } from "./flavours";

export default class Allocator {
  constructor(
    public mem: WebAssembly.Memory,
    private start: Ptr = mem.buffer.byteLength,
    private at = start,
  ) {}

  alloc(size: Bytes) {
    if (this.at >= this.mem.buffer.byteLength) this.mem.grow(1);

    const addr = this.at;
    this.at += size;
    this.align(8);
    return addr;
  }

  align(multiple: Bytes) {
    const offset = this.at % multiple;
    if (offset) this.at += multiple - offset;
  }
}
