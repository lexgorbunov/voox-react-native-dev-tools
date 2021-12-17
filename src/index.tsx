import {NativeEventEmitter, NativeModules, Platform} from 'react-native'
import rnfs from 'react-native-fs'
import type {
  DevToolsPresentResult,
  DiscordParams,
  DiscordResponse,
  FileNotExists,
  JiraIssue,
  JiraIssueResponse,
  SlackResponse,
  TrelloParams,
  UploadParams,
} from './types'
import {uploadToSlack} from './slack'
import {createJiraIssue} from './jira'
import {uploadToDiscord} from './discord'
import {uploadToTrello} from './trello'

const LINKING_ERROR =
  `The package 'react-native-dev-tools' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ios: "- You have run 'pod install'\n", default: ''}) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n'

const DevTools = NativeModules.DevTools
  ? NativeModules.DevTools
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR)
        },
      },
    )

const devToolsEmitter = new NativeEventEmitter(DevTools)

const MOSCOW_TIMEZONE_OFFSET = -180

export enum LogLevel {
  NONE,
  ERROR,
  WARN,
  LOG,
  DEBUG,
  TRACE,
}

class _DevTools {
  constructor() {
    devToolsEmitter.addListener('DevToolsData', () => {
      DevTools.presentDevTools()
    })
  }

  async setup(options: {enableShaker?: boolean; preserveLog?: boolean}) {
    if (options.enableShaker) this.enableShaker(true)
    if (!options.preserveLog) await this.deleteLogFile()
  }

  logLevel: LogLevel = LogLevel.LOG

  async error(message: string, e: any = undefined): Promise<boolean> {
    const level = LogLevel.ERROR
    if (this.logLevel < level) return false
    return DevTools.writeLog(_DevTools.makeLogString(level, message, e))
  }

  async warn(message: string, e: any = undefined): Promise<boolean> {
    const level = LogLevel.WARN
    if (this.logLevel < level) return false
    return DevTools.writeLog(_DevTools.makeLogString(level, message, e))
  }

  async log(message: string, e: any = undefined): Promise<boolean> {
    const level = LogLevel.LOG
    if (this.logLevel < level) return false
    return DevTools.writeLog(_DevTools.makeLogString(level, message, e))
  }

  async debug(message: string, e: any = undefined): Promise<boolean> {
    const level = LogLevel.DEBUG
    if (this.logLevel < level) return false
    return DevTools.writeLog(_DevTools.makeLogString(level, message, e))
  }

  async trace(message: string, e: any = undefined): Promise<boolean> {
    const level = LogLevel.TRACE
    if (this.logLevel < level) return false
    return DevTools.writeLog(_DevTools.makeLogString(level, message, e))
  }

  getAllLogs(): Promise<string> {
    return DevTools.getAllLogs()
  }

  screenshot(): Promise<string> {
    return DevTools.screenshot()
  }

  presentDevTools(): Promise<DevToolsPresentResult | undefined | null> {
    return DevTools.presentDevTools()
  }

  deleteLogFile(): Promise<boolean> {
    return DevTools.deleteLogFile()
  }

  enableShaker(enable: boolean) {
    DevTools.enableShaker(enable)
  }

  async sendDevLogsToSlack(
    params: UploadParams,
  ): Promise<SlackResponse | FileNotExists> {
    const exists = await rnfs.exists(params.logFilePath)
    if (!exists) return 'notExists'
    return uploadToSlack(params)
  }

  async sendDevLogsToTrello(
    params: TrelloParams,
  ): Promise<SlackResponse | FileNotExists> {
    const exists = await rnfs.exists(params.logFilePath)
    if (!exists) return 'notExists'
    return uploadToTrello(params)
  }

  async sendDevLogsToDiscord(
    params: DiscordParams,
  ): Promise<DiscordResponse | FileNotExists> {
    const exists = await rnfs.exists(params.logFilePath)
    if (!exists) return 'notExists'
    return uploadToDiscord(params)
  }

  async createJiraIssue(
    params: JiraIssue,
  ): Promise<JiraIssueResponse | FileNotExists> {
    const exists = await rnfs.exists(params.logFilePath)
    if (!exists) return 'notExists'
    return createJiraIssue(params)
  }

  private static makeLogString(
    level: LogLevel,
    message: string,
    e?: Error,
  ): string {
    const date = _DevTools.getMoscowDate()
    const day = date.getDate()
    const month = date.getMonth() + 1
    const DD = _DevTools.pad(day)
    const MM = _DevTools.pad(month)
    const HH = _DevTools.pad(date.getHours())
    const mm = _DevTools.pad(date.getMinutes())
    const ss = _DevTools.pad(date.getSeconds())
    const time = `${DD}.${MM}.${date.getFullYear()} ${HH}:${mm}:${ss}`
    let error = ''
    if (e) {
      if (e.message) error += `\n${e.message}`
      if (e.stack) error += `\n${e.stack}`
    }
    let type = '?'
    switch (level) {
      case LogLevel.ERROR:
        type = 'ERROR'
        break
      case LogLevel.WARN:
        type = 'WARN'
        break
      case LogLevel.LOG:
        type = 'LOG'
        break
      case LogLevel.DEBUG:
        type = 'DEBUG'
        break
      case LogLevel.TRACE:
        type = 'TRACE'
        break
    }
    return `[${time} ${type}]:\n${message}${error}\n`
  }

  private static pad(value: number): string {
    return value < 10 ? `0${value}` : value.toString(10)
  }

  private static getMoscowDate(): Date {
    const date = new Date()
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
      ) +
        date.getTimezoneOffset() * 60000 -
        MOSCOW_TIMEZONE_OFFSET * 60000,
    )
  }
}

export const devTools = new _DevTools()
export type {DevToolsPresentResult}
