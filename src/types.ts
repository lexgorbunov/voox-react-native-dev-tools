export interface UploadParams {
  logFilePath: string
  screenshotPath?: string
  slack?: {
    token: string
    channel: string
  }
}

export interface JiraIssue {
  logFilePath: string
  screenshotPath?: string
  jira: {
    email: string
    token: string
    project: string
    summary: string
  }
}

export type UploadResponse = Promise<'notExists' | 'success' | Error>

type JiraError = {
  type: 'error'
  message:
    | 'errorCreateIssue'
    | 'errorUploadLogFile'
    | 'errorUploadScreenshot'
    | Error
}

type JiraSuccess = {
  type: 'success'
  issue: string
}

export type JiraIssueResponse = Promise<JiraError | JiraSuccess>

export interface DevToolsPresentResult {
  readonly logFilePath: string
  readonly screenshotPath?: string
}
