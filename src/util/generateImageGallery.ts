import {promises as fs} from 'fs';

import ejs from 'ejs';

import {DiffResults} from '../types';

export async function generateImageGallery(target: string, data: DiffResults) {
  const template = require('../template').default;
  const html = ejs.render(template.html, {
    images: JSON.stringify(data),
  });

  await fs.writeFile(target, html);
}
