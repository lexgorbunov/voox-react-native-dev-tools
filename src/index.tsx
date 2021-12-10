import {NativeEventEmitter, NativeModules, Platform} from 'react-native'
import rnfs from 'react-native-fs'

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

export interface DevToolsPresentResult {
  readonly logFile: string
  readonly screenshot?: string
}

export enum LogLevel {
  NONE,
  ERROR,
  WARN,
  LOG,
  DEBUG,
  TRACE,
}

class _DevTools {
  private autoShowResult?: (data: DevToolsPresentResult) => void

  constructor() {
    devToolsEmitter.addListener('DevToolsData', (data: DevToolsPresentResult) =>
      this.autoShowResult?.(data),
    )
  }

  async setup(options: {
    resultHandler?: (data: DevToolsPresentResult) => void
    enableShaker?: boolean
    preserveLog?: boolean
  }) {
    this.autoShowResult = options.resultHandler
    if (options.enableShaker) this.enableShaker(true)
    if (!options.preserveLog) await this.removeLogFile()
  }

  logLevel: LogLevel = LogLevel.LOG

  async error(message: string, e: any = undefined): Promise<boolean> {
    const level = LogLevel.ERROR
    if (this.logLevel < level) return false
    return DevTools.writeLog(this.makeLogString(level, message, e))
  }

  async warn(message: string, e: any = undefined): Promise<boolean> {
    const level = LogLevel.WARN
    if (this.logLevel < level) return false
    return DevTools.writeLog(this.makeLogString(level, message, e))
  }

  async log(message: string, e: any = undefined): Promise<boolean> {
    const level = LogLevel.LOG
    if (this.logLevel < level) return false
    return DevTools.writeLog(this.makeLogString(level, message, e))
  }

  async debug(message: string, e: any = undefined): Promise<boolean> {
    const level = LogLevel.DEBUG
    if (this.logLevel < level) return false
    return DevTools.writeLog(this.makeLogString(level, message, e))
  }

  async trace(message: string, e: any = undefined): Promise<boolean> {
    const level = LogLevel.TRACE
    if (this.logLevel < level) return false
    return DevTools.writeLog(this.makeLogString(level, message, e))
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

  removeLogFile(): Promise<boolean> {
    return DevTools.removeLogFile()
  }

  enableShaker(enable: boolean) {
    DevTools.enableShaker(enable)
  }

  async sendDevLogs(
    path: string,
    screenshotBase64?: string,
  ): Promise<'notExists' | 'success' | Error> {
    console.log('🔦 screenshot', 'dataExists', !!screenshotBase64)
    const exists = await rnfs.exists(path)
    if (!exists) {
      console.log("📜 File doesn't exist")
      return 'notExists'
    }
    try {
      const r = rnfs.uploadFiles({
        files: [
          {
            name: 'file',
            filename: 'log.txt',
            filepath: path,
            filetype: 'txt',
          },
        ],
        method: 'POST',
        toUrl: 'https://slack.com/api/files.upload',
        fields: {
          channels: 'C025K24LWF6',
          filetype: 'text',
          title: `${Platform.OS} ${new Date().toISOString()}.txt`,
          token: `xoxb-1270849721780-2158556854583-6IsYXrMLl0Nf1f4hbXdBcMS9`,
        },
      })
      await r.promise
      console.log('📜 Logs sent')
      return 'success'
    } catch (e) {
      console.error('📜 Logs send error.', e)
      return e as Error
    }
  }

  private makeLogString(level: LogLevel, message: string, e?: Error): string {
    const date = this.getMoscowDate()
    const day = date.getDate()
    const month = date.getMonth() + 1
    const DD = this.pad(day)
    const MM = this.pad(month)
    const HH = this.pad(date.getHours())
    const mm = this.pad(date.getMinutes())
    const ss = this.pad(date.getSeconds())
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
    return `${time} ${type}: ${message}${error}`
  }

  private pad(value: number): string {
    return value < 10 ? `0${value}` : value.toString(10)
  }

  private getMoscowDate(): Date {
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
