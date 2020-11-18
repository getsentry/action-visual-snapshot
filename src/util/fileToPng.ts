import {createReadStream} from 'fs';
import {PNG} from 'pngjs';
import * as Sentry from '@sentry/node';

/**
 * Given a path to a PNG, returns a pngjs object
 */
export async function fileToPng(file: string): Promise<PNG> {
  const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
  const span = transaction?.startChild({
    op: 'fileToPng',
    description: file,
  });

  return new Promise((resolve, reject) =>
    createReadStream(file)
      .pipe(
        new PNG({
          filterType: 4,
        })
      )
      .on('parsed', function () {
        resolve(this);
        span?.finish();
      })
      .on('error', function (err) {
        reject(err);
        span?.finish();
      })
  );
}
