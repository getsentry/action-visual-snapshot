import path from 'path';
import {promises as fs} from 'fs';

export async function build() {
  const html = await fs.readFile(
    path.resolve(__dirname, './index.ejs'),
    'utf8'
  );
  return await fs.writeFile(
    path.resolve(__dirname, './index.ts'),
    `const template = ${JSON.stringify({html})}; export default template`
  );
}

build()
  .then(() => true)
  .catch(err => {
    throw err;
  });
