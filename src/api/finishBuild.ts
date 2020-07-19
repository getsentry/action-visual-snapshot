import bent from 'bent';

const put = bent('https://bv.ngrok.io/api', 'PUT', 'json', 200);

type Params = {
  id: string;
  owner: string;
  repo: string;
  token: string;
  conclusion: string;
  images: {
    alt: string;
    image_url: string;
  }[];
  results: {
    changed: Record<string, string>;
    missing: Record<string, string>;
    added: Record<string, string>;
  };
  galleryUrl?: string;
};

export async function finishBuild({token, ...body}: Params) {
  return await put('/build', body, {
    'x-padding-token': token,
  });
}
