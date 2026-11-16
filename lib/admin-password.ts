import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import type { ScryptOptions } from "node:crypto";

const KEY_LENGTH = 64;
const PARAMETERS = { N: 16_384, r: 8, p: 1 } as const;

function deriveKey(password: string, salt: Buffer, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(
      password,
      salt,
      KEY_LENGTH,
      { ...options, maxmem: 64 * 1024 * 1024 },
      (error, derivedKey) => {
        if (error) reject(error);
        else resolve(derivedKey);
      },
    );
  });
}

export async function hashAdminPassword(password: string): Promise<string> {
  if (Buffer.byteLength(password, "utf8") < 12 || Buffer.byteLength(password, "utf8") > 128) {
    throw new Error("Administrator passwords must be between 12 and 128 bytes.");
  }

  const salt = randomBytes(16);
  const derivedKey = await deriveKey(password, salt, PARAMETERS);
  return [
    "scrypt",
    String(PARAMETERS.N),
    String(PARAMETERS.r),
    String(PARAMETERS.p),
    salt.toString("base64url"),
    derivedKey.toString("base64url"),
  ].join("$");
}

export async function verifyAdminPassword(password: string, storedHash: string): Promise<boolean> {
  if (Buffer.byteLength(password, "utf8") > 128) return false;

  const [algorithm, nRaw, rRaw, pRaw, saltRaw, keyRaw, extra] = storedHash.split("$");
  if (
    algorithm !== "scrypt" ||
    nRaw !== String(PARAMETERS.N) ||
    rRaw !== String(PARAMETERS.r) ||
    pRaw !== String(PARAMETERS.p) ||
    !saltRaw ||
    !keyRaw ||
    extra !== undefined
  ) {
    return false;
  }

  try {
    const salt = Buffer.from(saltRaw, "base64url");
    const expected = Buffer.from(keyRaw, "base64url");
    if (salt.length !== 16 || expected.length !== KEY_LENGTH) return false;

    const actual = await deriveKey(password, salt, PARAMETERS);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
