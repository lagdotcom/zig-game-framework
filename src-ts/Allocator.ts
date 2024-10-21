import { Bytes, Ptr } from "./flavours";

const WASM_PAGE_SIZE: Bytes = 64 * 1024;

function aligned(size: Bytes, alignment: Bytes): Bytes {
  const offset = size % alignment;
  return offset ? size + (alignment - size) : size;
}

interface Block {
  addr: Ptr;
  size: Bytes;
  free: boolean;
}

export default class Allocator {
  blocks: Block[];

  constructor(public mem: WebAssembly.Memory) {
    this.blocks = [{ addr: mem.buffer.byteLength, size: 0, free: true }];
  }

  private reserve(rawSize: Bytes) {
    const size = aligned(rawSize, 8);
    const free = this.getFreeBlock(size) ?? this.extend();

    const block = free.size > size ? this.split(free, size) : free;
    block.free = false;

    return block.addr;
  }

  private getFreeBlock(size: Bytes) {
    for (const block of this.blocks)
      if (block.free && block.size >= size) return block;
  }

  private extend() {
    const addr = this.mem.buffer.byteLength;
    this.mem.grow(1);

    const last = this.blocks[this.blocks.length - 1];
    if (last.free) last.size += WASM_PAGE_SIZE;
    else this.blocks.push({ addr, size: WASM_PAGE_SIZE, free: true });

    return this.blocks[this.blocks.length - 1];
  }

  private split(large: Block, size: Bytes) {
    const block: Block = { addr: large.addr, size, free: false };
    large.addr += size;
    large.size -= size;

    const index = this.blocks.indexOf(large);
    this.blocks.splice(index, 0, block);

    return block;
  }

  alloc<T extends Ptr>(size: Bytes): T {
    const ptr = this.reserve(size) as T;

    const view = new DataView(this.mem.buffer, ptr);
    for (let i = 0; i < size; i += 8) view.setBigInt64(i, 0n);

    return ptr;
  }

  free<T extends Ptr>(ptr: T) {
    const index = this.blocks.findIndex((b) => b.addr === ptr);
    if (index < 0) throw new Error(`tried to free unallocated block @${ptr}`);

    const block = this.blocks[index];
    if (block.free) {
      console.warn(`tried to free already free block @${ptr}`);
      return;
    }

    block.free = true;

    // TODO improve this consolidation later
    const after = this.blocks[index + 1];
    if (after && after.free) {
      after.addr -= block.size;
      after.size += block.size;

      this.blocks.splice(index, 1);
    }
  }
}
