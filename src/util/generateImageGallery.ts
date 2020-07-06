import {promises as fs} from 'fs';

import ejs from 'ejs';
import template from '../template';

export async function generateImageGallery(
  target: string,
  data: {
    changed: Record<string, string>;
    missing?: Record<string, string>;
    added?: Record<string, string>;
    differentSize?: Record<string, string>;
  }
) {
  const html = ejs.render(template.html, {
    images: JSON.stringify(data),
  });

  await fs.writeFile(target, html);
}
