import type {UploadParams, UploadResponse} from './types'
import rnfs from 'react-native-fs'
import {Platform} from 'react-native'

export const uploadToSlack = async (params: UploadParams): UploadResponse => {
  if (!params.slack) return 'success'
  try {
    console.log('[Slack.uploadToSlack]', params)
    const r = rnfs.uploadFiles({
      files: [
        {
          name: 'file',
          filename: 'log.txt',
          filepath: params.logFilePath,
          filetype: 'txt',
        },
      ],
      method: 'POST',
      toUrl: 'https://slack.com/api/files.upload',
      fields: {
        channels: params.slack.channel,
        title: `${Platform.OS} ${new Date().toISOString()}.txt`,
        token: params.slack.token,
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
