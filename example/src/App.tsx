import * as React from 'react'

import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {devTools, DevToolsPresentResult} from 'react-native-dev-tools'

export default function App() {
  // const [logs, setLogs] = useState('')
  // const [screenshot, setScreenshot] = useState<string | null>(null)

  const initLogs = async () => {
    devTools.setup({
      resultHandler: (data: DevToolsPresentResult) => {
        if (data) sendLogs(data)
      },
      enableShaker: true,
    })
    await devTools.removeLogFile()
    devTools.log('1 some log')
    devTools.error('1 some error', new Error('Error text'))
    devTools.warn('1 some Warn')
  }

  React.useEffect(() => {
    initLogs()
    // devTools.screenshot().then(setScreenshot)
  }, [])

  const sendLogs = async (data: DevToolsPresentResult) => {
    const sendResult = await devTools.sendDevLogs(data.logFile, data.screenshot)
    switch (sendResult) {
      case 'notExists':
        console.log("📜 File doesn't exist")
        break
      case 'success':
        console.log('📜 Logs sent')
        break
      default:
        console.error('📜 Logs send error.', sendResult)
    }
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
