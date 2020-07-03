import {promises as fs} from 'fs';
import ejs from 'ejs';

export async function generateImageGallery(
  target: string,
  data: {changed: Record<string, string>}
) {
  const html = ejs.render(await fs.readFile('./index.ejs', 'utf8'), {
    images: JSON.stringify(data),
  });

  await fs.writeFile(target, html);
}
