declare namespace NodeJS {
  export interface ProcessEnv {
    GITHUB_BASE_REF: string;
    GITHUB_HEAD_REF: string;
    GITHUB_EVENT_PATH: string;
    GITHUB_WORKSPACE: string;
    GITHUB_WORKFLOW: string;
  }
}
