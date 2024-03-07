export interface WorkerData {
  filePath: string;
  fileType: string;
  mode: string;
  domainRegex: string;
  contentRegex: string;
  timeout: number;
}

export type ErrorMessage = {
  type: "error";
  text: string;
};

export type DomainMessage = {
  type: "domain";
  filePath: string;
};

export type ContentMessage = {
  type: "content";
  filePath: string;
};

export type WorkerMessage = ErrorMessage | DomainMessage | ContentMessage;
