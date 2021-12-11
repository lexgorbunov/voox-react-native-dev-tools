export type FileNotExists = 'notExists'

export interface UploadParams {
  logFilePath: string
  screenshotPath?: string
  summary: string
  slack: {
    token: string
    token2: string
    channel: string
  }
}

export interface DiscordParams {
  logFilePath: string
  screenshotPath?: string
  summary: string
  discord: {
    webhook: string
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

type SlackError = {
  type: 'error'
  message:
    | 'errorCreateMessage'
    | 'errorUploadLogFile'
    | 'errorUploadScreenshot'
    | Error
}

type SlackSuccess = {
  type: 'success'
}

export type SlackResponse = Promise<SlackSuccess | SlackError>

type DiscordError = {
  type: 'error'
  message:
    | 'errorCreateMessage'
    | 'errorUploadLogFile'
    | 'errorUploadScreenshot'
    | Error
}

type DiscordSuccess = {
  type: 'success'
}

export type DiscordResponse = Promise<DiscordSuccess | DiscordError>

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
  readonly summary: string
  readonly logFilePath: string
  readonly screenshotPath?: string
}
