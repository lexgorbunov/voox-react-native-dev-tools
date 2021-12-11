import * as React from 'react'

import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import type {DevToolsPresentResult} from 'react-native-dev-tools'
import {devTools} from 'react-native-dev-tools'

export default function App() {
  // const [logs, setLogs] = useState('')
  // const [screenshot, setScreenshot] = useState<string | null>(null)

  const initLogs = async () => {
    await devTools.setup({enableShaker: true})
    devTools.log('1 some log')
    devTools.error('1 some error', new Error('Error text'))
    devTools.warn('1 some Warn')
  }

  React.useEffect(() => {
    initLogs()
    // devTools.screenshot().then(setScreenshot)
  }, [])

  const sendToSlack = async (data: DevToolsPresentResult) => {
    const sendResult = await devTools.sendDevLogsToSlack({
      logFilePath: data.logFilePath,
      screenshotPath: data.screenshotPath,
      summary: data.summary,
      slack: {
        token: 'xoxb-1270849721780-2158556854583-dgHqzxQDYZtzlw8sadOzBOu8',
        token2:
          'xoxp-1270849721780-1263291811317-2826578503635-396bfee19f8bbbd054525944750f7f7b',
        channel: 'C025K24LWF6',
      },
    })
    console.log('[App.sendToSlack]', sendResult)
  }

  const sendToDiscord = async (data: DevToolsPresentResult) => {
    const sendResult = await devTools.sendDevLogsToDiscord({
      logFilePath: data.logFilePath,
      screenshotPath: data.screenshotPath,
      summary: data.summary,
      discord: {
        webhook:
          'https://discord.com/api/webhooks/918915334168256522/mZRVbzVCNSRaDCKxyr-dZhw_4uG4nU3ptlteu2NvEGLUPLeKWUPxL6uuhUHNRDlACV42',
      },
    })
    console.log('[App.sendToDiscord]', sendResult)
  }

  const showDev = async () => {
    const presentResult = await devTools.presentDevTools()
    if (presentResult) await sendToDiscord(presentResult)
  }

  return (
    <View style={styles.container}>
      <Text style={{backgroundColor: 'red'}}>some awesome text</Text>

      <TouchableOpacity onPress={showDev}>
        <Text>Show Dev</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'yellow',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
})
