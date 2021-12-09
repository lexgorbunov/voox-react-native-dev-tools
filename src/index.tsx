import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-dev-tools' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const DevTools = NativeModules.DevTools
  ? NativeModules.DevTools
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

class _DevTools {
  log(message: string) {
    DevTools.writeLog(message)
  }

  getAllLogs(): Promise<string> {
    return DevTools.getAllLogs()
  }

  screenshot(): Promise<string> {
    return DevTools.screenshot()
  }

  async presentDevTools() {
    const response = await DevTools.presentDevTools()
    console.log('[Index.presentDevTools]', response)
  }
}

export const devTools = new _DevTools()
