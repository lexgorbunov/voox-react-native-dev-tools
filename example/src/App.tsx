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

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sendToTrello = async (data: DevToolsPresentResult) => {
    const sendResult = await devTools.sendDevLogsToTrello({
      logFilePath: data.logFilePath,
      screenshotPath: data.screenshotPath,
      summary: data.summary,
      trello: {
        token:
          '2fd8e554d8c4d62492cdec2b7e3e340c40e2b5f71041cc1c39e38c75a994600c',
        apiKey: '9591e9521f0c60541c07c3eb8bdeff61',
        listId: '6173c87b7f5968220f0123f4', // backlog
      },
    })
    console.log('[App.sendToDiscord]', sendResult)
  }

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    if (presentResult) await sendToTrello(presentResult)
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
