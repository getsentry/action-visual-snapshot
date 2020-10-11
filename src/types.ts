import pixelmatch from 'pixelmatch';

export type PixelmatchOptions = Exclude<
  Parameters<typeof pixelmatch>[5],
  undefined
>;

// From https://stackoverflow.com/questions/48011353/how-to-unwrap-type-of-a-promise?rq=1
export type Await<T> = T extends {
  then(onfulfilled?: (value: infer U) => unknown): unknown;
}
  ? U
  : T;
