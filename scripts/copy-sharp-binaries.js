const {exec} = require('child_process');
const path = require('path');
const fs = require('fs');

exec(
  'find node_modules/odiff-bin -name ODiffBin',
  async (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }

    const paths = stdout.split('\n');

    for (const filepath of paths) {
      if (filepath.includes('workaround') || !filepath.endsWith('ODiffBin')) {
        continue;
      }

      let dir = filepath.replace('node_modules/odiff-bin/', '').split('/');
      dir.pop();
      dir = dir.join('/');

      fs.mkdirSync(dir, {recursive: true});
      fs.copyFileSync(filepath, `${dir}/${path.basename(filepath)}`);
    }
  }
);
