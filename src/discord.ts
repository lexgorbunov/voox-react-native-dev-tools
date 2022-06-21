import type {DiscordParams, DiscordResponse} from './types'
import rnfs from 'react-native-fs'

export const uploadToDiscord = async (
  params: DiscordParams,
): DiscordResponse => {
  try {
    console.log('[Discord.uploadToDiscord]', params)
    const r = rnfs.uploadFiles({
      files: [
        {
          name: 'file1',
          filename: 'screenshot.jpg',
          filepath: params.screenshotPath!,
          filetype: 'jpg',
        },
        {
          name: 'file',
          filename: 'log.txt',
          filepath: params.logFilePath,
          filetype: 'txt',
        },
      ],
      method: 'POST',
      toUrl: params.discord.webhook,
      fields: {
        payload_json: JSON.stringify({
          content: params.summary,
        }),
      },
    })
    const response = await r.promise
    console.log('[Discord.uploadToDiscord]', response)
    if (response.statusCode === 200) {
      return {type: 'success'}
    }
    return {type: 'error', message: 'errorCreateMessage'}
  } catch (e) {
    console.log('[Discord.uploadToDiscord]', e)
    throw e
  }
}
