import path from 'path';
import {promises as fs} from 'fs';

async function main() {
  const html = await fs.readFile(
    path.resolve(__dirname, './index.ejs'),
    'utf8'
  );
  return await fs.writeFile(
    path.resolve(__dirname, './index.ts'),
    `const template = ${JSON.stringify({html})}; export default template`
  );
}

main();
