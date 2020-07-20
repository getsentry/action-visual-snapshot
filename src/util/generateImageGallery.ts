import {promises as fs} from 'fs';

import ejs from 'ejs';
import template from '../template';

export async function generateImageGallery(
  target: string,
  data: {
    baseFilesLength: number;
    changed: string[];
    missing?: string[];
    added?: string[];
  }
) {
  const html = ejs.render(template.html, {
    images: JSON.stringify(data),
  });

  await fs.writeFile(target, html);
}
