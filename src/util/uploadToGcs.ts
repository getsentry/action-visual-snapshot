import path from 'path';

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

  const resultPromises: Promise<{alt: string; image_url: string}>[] = [];
  const bucketReference = storage.bucket(bucket);

  for (const file of files) {
    const relativeFilePath = path.relative(root, file);
    const uploadPromise = bucketReference
      .upload(file, {
        destination: `${destinationRoot}/${relativeFilePath}`,
        gzip: true,
        metadata: {
          cacheControl: 'public, max-age=31536000',
        },
      })
      .then(([File]) => ({
        alt: relativeFilePath,
        image_url: `https://storage.googleapis.com/${bucket}/${File.name}`,
      }));

    resultPromises.push(uploadPromise);
  }

  return Promise.all(resultPromises).then(results =>
    results.filter(r => r.image_url.includes('/diffs/'))
  );
}
