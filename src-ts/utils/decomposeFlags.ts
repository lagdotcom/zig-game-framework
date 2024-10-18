function hasFlag(v: number | bigint, key: string) {
  if (key === "0") return false;

  if (typeof v === "number") {
    const keyValue = parseInt(key, 10);
    if (isNaN(keyValue)) return false;
    return (v & keyValue) == keyValue;
  }

  try {
    const keyValue = BigInt(key);
    return (v & keyValue) == keyValue;
  } catch {
    return false;
  }
}

export default function decomposeFlags(v: number | bigint, flags: object) {
  const found: string[] = [];

  for (const [key, val] of Object.entries(flags))
    if (hasFlag(v, key)) found.push(String(val));

  return found.length ? found.join("|") : "NONE";
}
