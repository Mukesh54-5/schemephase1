import fs from 'node:fs';
import path from 'node:path';

export interface PackIndex {
  header: Record<string, [number, number]>;
  dataOffset: number;
}

const PACK_MAGIC = Buffer.from('KSPK', 'ascii');
const indexCache = new Map<string, { mtimeMs: number; size: number; index: PackIndex }>();

export function normalizeAssetRelPath(relPath: string): string | null {
  const cleaned = relPath.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!cleaned || cleaned.includes('..') || cleaned.includes('\0')) {
    return null;
  }
  return cleaned;
}

export function getMimeTypeForAsset(assetPath: string): string | null {
  const ext = path.extname(assetPath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.svg') return 'image/svg+xml';
  return null;
}

export function packAssets(
  baseDir: string,
  subdirs: readonly string[],
  outPackPath: string
): { count: number; totalBytes: number } {
  const chunks: Buffer[] = [];
  const header: Record<string, [number, number]> = {};
  let offset = 0;
  let count = 0;

  for (const sub of [...subdirs].sort()) {
    const dirPath = path.join(baseDir, sub);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs
      .readdirSync(dirPath)
      .filter((f) => !f.startsWith('.') && getMimeTypeForAsset(f) !== null)
      .sort();

    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      if (!fs.statSync(fullPath).isFile()) continue;
      const buf = fs.readFileSync(fullPath);
      if (buf.length === 0) continue;

      const relKey = `${sub}/${file}`.replace(/\\/g, '/');
      header[relKey] = [offset, buf.length];
      chunks.push(buf);
      offset += buf.length;
      count += 1;
    }
  }

  const headerBuf = Buffer.from(JSON.stringify(header), 'utf8');
  const headerLenBuf = Buffer.alloc(4);
  headerLenBuf.writeUInt32BE(headerBuf.length, 0);

  fs.mkdirSync(path.dirname(outPackPath), { recursive: true });
  const tmpPath = `${outPackPath}.tmp`;
  const fd = fs.openSync(tmpPath, 'w');
  try {
    fs.writeSync(fd, PACK_MAGIC);
    fs.writeSync(fd, headerLenBuf);
    fs.writeSync(fd, headerBuf);
    for (const chunk of chunks) {
      fs.writeSync(fd, chunk);
    }
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(tmpPath, outPackPath);
  indexCache.delete(outPackPath);

  return {
    count,
    totalBytes: 8 + headerBuf.length + offset,
  };
}

export function readPackIndex(packPath: string): PackIndex | null {
  if (!fs.existsSync(packPath)) return null;
  const stat = fs.statSync(packPath);
  if (!stat.isFile() || stat.size < 10) return null;

  const cached = indexCache.get(packPath);
  if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
    return cached.index;
  }

  const fd = fs.openSync(packPath, 'r');
  try {
    const prefix = Buffer.alloc(8);
    if (fs.readSync(fd, prefix, 0, 8, 0) !== 8) return null;
    if (!prefix.subarray(0, 4).equals(PACK_MAGIC)) return null;

    const headerLen = prefix.readUInt32BE(4);
    if (headerLen <= 0 || 8 + headerLen > stat.size) return null;

    const headerBuf = Buffer.alloc(headerLen);
    if (fs.readSync(fd, headerBuf, 0, headerLen, 8) !== headerLen) return null;

    const parsed = JSON.parse(headerBuf.toString('utf8')) as Record<string, [number, number]>;
    const index: PackIndex = {
      header: parsed,
      dataOffset: 8 + headerLen,
    };
    indexCache.set(packPath, { mtimeMs: stat.mtimeMs, size: stat.size, index });
    return index;
  } catch {
    return null;
  } finally {
    fs.closeSync(fd);
  }
}

export function readPackedAsset(packPath: string, relPath: string): Buffer | null {
  const safeRel = normalizeAssetRelPath(relPath);
  if (!safeRel) return null;

  const index = readPackIndex(packPath);
  if (!index) return null;

  const entry = index.header[safeRel];
  if (!entry || !Array.isArray(entry) || entry.length !== 2) return null;

  const [offset, length] = entry;
  if (offset < 0 || length <= 0) return null;

  const fd = fs.openSync(packPath, 'r');
  try {
    const out = Buffer.alloc(length);
    const bytesRead = fs.readSync(fd, out, 0, length, index.dataOffset + offset);
    if (bytesRead !== length) return null;
    return out;
  } finally {
    fs.closeSync(fd);
  }
}

export function unpackMissingAssets(packPath: string, targetBaseDir: string): number {
  const index = readPackIndex(packPath);
  if (!index) return 0;

  let restored = 0;
  const fd = fs.openSync(packPath, 'r');
  try {
    for (const [rawKey, [offset, length]] of Object.entries(index.header)) {
      const safeRel = normalizeAssetRelPath(rawKey);
      if (!safeRel || offset < 0 || length <= 0) continue;

      const destPath = path.join(targetBaseDir, safeRel);
      const needsRestore =
        !fs.existsSync(destPath) || fs.statSync(destPath).size < 100;

      if (!needsRestore) continue;

      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      const buf = Buffer.alloc(length);
      const bytesRead = fs.readSync(fd, buf, 0, length, index.dataOffset + offset);
      if (bytesRead === length) {
        fs.writeFileSync(destPath, buf);
        restored += 1;
      }
    }
  } finally {
    fs.closeSync(fd);
  }

  return restored;
}
