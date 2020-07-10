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

  const results = [];

  for (const file of files) {
    const relativeFilePath = path.relative(root, file);
    const [File] = await storage.bucket(bucket).upload(file, {
      destination: `${destinationRoot}/${relativeFilePath}`,
      gzip: true,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });

    results.push({
      alt: relativeFilePath,
      image_url: `https://storage.googleapis.com/${bucket}/${File.name}`,
    });
  }

  return results.filter(({image_url}) => image_url.includes('/diffs/'));
}
