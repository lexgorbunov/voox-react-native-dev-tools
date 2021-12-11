import type {SlackResponse, UploadParams} from './types'
import rnfs from 'react-native-fs'
import {Platform} from 'react-native'

const uploadFile = async (params: {
  filename: string
  path: string
  type: string
  token: string
  channel: string
  content?: string
}) => {
  let r = rnfs.uploadFiles({
    files: [
      {
        name: 'file',
        filename: params.filename,
        filepath: params.path,
        filetype: params.type,
      },
    ],
    method: 'POST',
    toUrl: `https://slack.com/api/files.upload`,
    fields: {
      // channels: params.channel,
      token: params.token,
    },
  })
  let uploadResponse = await r.promise
  let json = JSON.parse(uploadResponse.body)
  console.log('[Slack.uploadFile]', json)
  return json.ok
}

export const uploadToSlack = async (params: UploadParams): SlackResponse => {
  try {
    console.log('[Slack.uploadToSlack]', params)

    // let response = await fetch(`https://slack.com/api/chat.postMessage`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${params.slack.token}`,
    //   },
    //   body: JSON.stringify({
    //     channel: params.slack.channel,
    //     blocks: [
    //       {
    //         type: 'header',
    //         text: {
    //           type: 'plain_text',
    //           text: `:point_down: BEGIN LOG (${Platform.OS.toUpperCase()})`,
    //           emoji: true,
    //         },
    //       },
    //       {
    //         type: 'context',
    //         elements: [{type: 'plain_text', text: `Awesome conetnt`}],
    //       },
    //     ],
    //   }),
    // })

    // if (params.screenshotPath) {
    //   let uploadStatus = await uploadFile({
    //     filename: 'screenshot.jpg',
    //     path: params.screenshotPath,
    //     type: 'jpg',
    //     token: params.slack.token,
    //     channel: params.slack.channel,
    //   })
    //   if (!uploadStatus)
    //     return {type: 'error', message: 'errorUploadScreenshot'}
    // }
    //
    // let uploadStatus = await uploadFile({
    //   filename: 'log.txt',
    //   path: params.logFilePath,
    //   type: 'txt',
    //   token: params.slack.token,
    //   channel: params.slack.channel,
    // })
    //
    // if (!uploadStatus) return {type: 'error', message: 'errorUploadLogFile'}

    // const json = await response.json()
    // console.log('[Slack.uploadToSlack]', response.status)
    return {type: 'success'}
  } catch (e) {
    return e as Error
  }
}
