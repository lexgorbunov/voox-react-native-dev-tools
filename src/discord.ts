import type {UploadResponse} from './types'
import type {DiscordParams} from './types'
import rnfs from 'react-native-fs'

export const uploadToDiscord = async (
  params: DiscordParams,
): UploadResponse => {
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
          content: params.content,
        }),
      },
    })
    const response = await r.promise
    const json = JSON.parse(response.body)
    if (json.ok) return 'success'
    throw new Error(json.error)
  } catch (e) {
    return e as Error
  }
}
