// From https://stackoverflow.com/questions/48011353/how-to-unwrap-type-of-a-promise?rq=1
type Await<T> = T extends {
  then(onfulfilled?: (value: infer U) => unknown): unknown;
}
  ? U
  : T;

declare namespace NodeJS {
  export interface ProcessEnv {
    GITHUB_BASE_REF: string;
    GITHUB_HEAD_REF: string;
    GITHUB_EVENT_PATH: string;
    GITHUB_WORKSPACE: string;
    GITHUB_WORKFLOW: string;
  }
}
