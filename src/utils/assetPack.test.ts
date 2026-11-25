import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getMimeTypeForAsset,
  normalizeAssetRelPath,
  packAssets,
  readPackIndex,
  readPackedAsset,
  unpackMissingAssets,
} from './assetPack.ts';

test('assetPack round-trips packed subdirectories, serves missing assets, and unpacks safely', () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'krishi-pack-'));
  try {
    const imagesDir = path.join(tmpRoot, 'images');
    fs.mkdirSync(path.join(imagesDir, 'technologies'), { recursive: true });
    fs.mkdirSync(path.join(imagesDir, 'soils'), { recursive: true });

    const techBytes = Buffer.alloc(4096, 0xaa);
    const soilBytes = Buffer.alloc(3200, 0xbb);
    fs.writeFileSync(path.join(imagesDir, 'technologies', 'drone.jpg'), techBytes);
    fs.writeFileSync(path.join(imagesDir, 'soils', 'loam.png'), soilBytes);
    // Non-image junk should be ignored
    fs.writeFileSync(path.join(imagesDir, 'soils', '.DS_Store'), Buffer.from('junk'));

    const packPath = path.join(tmpRoot, 'extra-images.pack');
    const summary = packAssets(imagesDir, ['technologies', 'soils'], packPath);
    assert.equal(summary.count, 2);
    assert.ok(fs.existsSync(packPath));

    const idx = readPackIndex(packPath);
    assert.ok(idx);
    assert.deepEqual(Object.keys(idx.header).sort(), [
      'soils/loam.png',
      'technologies/drone.jpg',
    ]);

    assert.deepEqual(readPackedAsset(packPath, 'technologies/drone.jpg'), techBytes);
    assert.deepEqual(readPackedAsset(packPath, '/soils/loam.png'), soilBytes);
    assert.equal(readPackedAsset(packPath, '../secrets.txt'), null);
    assert.equal(normalizeAssetRelPath('../escape.jpg'), null);
    assert.equal(getMimeTypeForAsset('technologies/drone.jpg'), 'image/jpeg');
    assert.equal(getMimeTypeForAsset('soils/loam.png'), 'image/png');

    // Simulate workspace restart deleting unpacked files
    const destDir = path.join(tmpRoot, 'restored');
    const restoredCount = unpackMissingAssets(packPath, destDir);
    assert.equal(restoredCount, 2);
    assert.deepEqual(
      fs.readFileSync(path.join(destDir, 'technologies', 'drone.jpg')),
      techBytes
    );
    assert.deepEqual(
      fs.readFileSync(path.join(destDir, 'soils', 'loam.png')),
      soilBytes
    );

    // Calling unpack again should not overwrite or report duplicate work
    assert.equal(unpackMissingAssets(packPath, destDir), 0);
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});
