import * as React from 'react';
import {useState} from 'react';

import {Dimensions, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {devTools} from 'react-native-dev-tools';

export default function App() {
  const [logs, setLogs] = useState('')
  const [screenshot, setScreenshot] = useState<string | null>(null)

  React.useEffect(() => {
    // devTools.log("some log")

    devTools.screenshot().then(setScreenshot)
  }, []);

  const showDev = () => {
    devTools.presentDevTools()
  }

  return (
    <View style={styles.container}>
      <Text style={{backgroundColor: 'red'}}>some awesome text</Text>

      <TouchableOpacity onPress={showDev}>
        <Text>Show Dev</Text>
      </TouchableOpacity>

      {!!screenshot && <Image source={{uri: `data:image/png;base64,${screenshot}`}} style={{
        width: Dimensions.get('window').width * 0.5,
        height: Dimensions.get('window').height * 0.5,
        borderWidth: 1,
        borderColor: 'green'
      }}/>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'yellow'
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
