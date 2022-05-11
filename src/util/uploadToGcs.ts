import path from 'path';
import {PromisePool} from '@supercharge/promise-pool';

import {getStorageClient} from './getStorageClient';

type UploadToGcsParams = {
  files: string[];
  root: string;
  bucket: string;
  destinationRoot: string;
};

export async function uploadToGcs({
  files,
  root,
  bucket,
  destinationRoot,
}: UploadToGcsParams) {
  const storage = getStorageClient();

  if (!storage) {
    return Promise.resolve([]);
  }

  const results: {alt: string; image_url: string}[] = [];
  const bucketReference = storage.bucket(bucket);

  await PromisePool.for(files)
    .withConcurrency(10)
    .process(async file => {
      const relativeFilePath = path.relative(root, file);

      await bucketReference
        .upload(file, {
          destination: `${destinationRoot}/${relativeFilePath}`,
          gzip: true,
          metadata: {
            cacheControl: 'public, max-age=31536000',
          },
        })
        .then(([File]) => {
          results.push({
            alt: relativeFilePath,
            image_url: `https://storage.googleapis.com/${bucket}/${File.name}`,
          });
        });
    });

  return results.filter(({image_url}) => image_url.includes('/diffs/'));
}
