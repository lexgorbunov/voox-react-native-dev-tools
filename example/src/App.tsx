import * as React from 'react'

import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {devTools} from 'react-native-dev-tools'
import type {DevToolsPresentResult} from 'react-native-dev-tools'

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

  const sendLogs = async (data: DevToolsPresentResult) => {
    // const sendResult = await devTools.sendDevLogsToSlack({
    //   logFilePath: data.logFilePath,
    //   screenshotPath: data.screenshotPath,
    //   slack: {
    //     token: 'xoxb-1270849721780-2158556854583-dgHqzxQDYZtzlw8sadOzBOu8',
    //     channel: 'C025K24LWF6',
    //   },
    // })

    const sendResult = await devTools.createJiraIssue({
      logFilePath: data.logFilePath,
      screenshotPath: data.screenshotPath,
      jira: {
        token: 'RrGYSzRM3vDmS9grZ8wT5613',
        email: 'sergeymild@yandex.ru',
        project: 'MOBI',
        summary: 'awesome summary',
      },
    })
    if (sendResult.type === 'error') {
      console.log('[App.sendLogs.error]', sendResult.message)
      return
    }
    console.log('[App.sendLogs.success]', sendResult.issue)
  }

  const showDev = async () => {
    const presentResult = await devTools.presentDevTools()
    if (presentResult) await sendLogs(presentResult)
  }

  return (
    <View style={styles.container}>
      <Text style={{backgroundColor: 'red'}}>some awesome text</Text>

      <TouchableOpacity onPress={showDev}>
        <Text>Show Dev</Text>
      </TouchableOpacity>

      {/*{!!screenshot && <Image source={{uri: `data:image/png;base64,${screenshot}`}} style={{*/}
      {/*  width: Dimensions.get('window').width * 0.5,*/}
      {/*  height: Dimensions.get('window').height * 0.5,*/}
      {/*  borderWidth: 1,*/}
      {/*  borderColor: 'green'*/}
      {/*}}/>}*/}
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
