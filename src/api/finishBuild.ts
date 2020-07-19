import bent from 'bent';

const put = bent('https://bv.ngrok.io/api', 'PUT', 'json', 200);

type Params = {
  id: number;
  owner: string;
  repo: string;
  token: string;
  conclusion: string;
  images: {
    alt: string;
    image_url: string;
  }[];
  results: {
    baseFilesLength: number;
    changed: string[];
    missing: string[];
    added: string[];
  };
  galleryUrl?: string;
};

export async function finishBuild({token, ...body}: Params) {
  return await put('/build', body, {
    'x-padding-token': token,
  });
}
