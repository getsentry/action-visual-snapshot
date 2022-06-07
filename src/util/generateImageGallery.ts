import {promises as fs} from 'fs';

import ejs from 'ejs';

export async function generateImageGallery(
  target: string,
  data: {
    terminationReason: 'maxChangedSnapshots' | null;
    baseFilesLength: number;
    changed: string[];
    missing?: string[];
    added?: string[];
  }
) {
  const template = require('../template').default;
  const html = ejs.render(template.html, {
    images: JSON.stringify(data),
  });

  await fs.writeFile(target, html);
}
