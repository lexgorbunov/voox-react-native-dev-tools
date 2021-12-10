export interface UploadParams {
  logFilePath: string
  screenshotPath?: string
  slack?: {
    token: string
    channel: string
  }
}

export type UploadResponse = Promise<'notExists' | 'success' | Error>

export interface DevToolsPresentResult {
  readonly logFilePath: string
  readonly screenshotPath?: string
}
