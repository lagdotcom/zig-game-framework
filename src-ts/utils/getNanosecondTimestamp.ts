import { Nanoseconds } from "../flavours";

export default function getNanosecondTimestamp(): Nanoseconds {
  // performance.now() only returns milliseconds, but it does have fractions
  return BigInt(Math.ceil(performance.now() * 1000000));
}
