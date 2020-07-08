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

  const tasks: Promise<any>[] = files.map(async file => {
    const relativeFilePath = path.relative(root, file);
    const [File] = await storage.bucket(bucket).upload(file, {
      destination: `${destinationRoot}/${relativeFilePath}`,
      gzip: true,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });

    return {
      alt: relativeFilePath,
      image_url: `https://storage.googleapis.com/${bucket}/${File.name}`,
    };
  });

  return await tasks.reduce(async (promiseChain, currentTask) => {
    const chainResults = await promiseChain;
    const currentResult = await currentTask;

    return [...chainResults, currentResult];
  }, Promise.resolve([]));
}
