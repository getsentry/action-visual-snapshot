import {createReadStream} from 'fs';
import {PNG} from 'pngjs';

/**
 * Given a path to a PNG, returns a pngjs object
 */
export async function fileToPng(file: string): Promise<PNG> {
  return new Promise((resolve, reject) =>
    createReadStream(file)
      .pipe(
        new PNG({
          filterType: 4,
        })
      )
      .on('parsed', function () {
        resolve(this);
      })
      .on('error', function (err) {
        reject(err);
      })
  );
}
