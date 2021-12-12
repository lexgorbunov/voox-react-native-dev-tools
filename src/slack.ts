import type {SlackResponse, UploadParams} from './types'
import rnfs from 'react-native-fs'
import {Platform} from 'react-native'

const makePublic = async (id: string, token: string) => {
  const publicResponse = await fetch(
    `https://slack.com/api/files.sharedPublicURL?file=${id}`,
    {
      method: 'POST',
      headers: {Authorization: `Bearer ${token}`},
    },
  )
  return publicResponse.json()
}

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
  // console.log('[Slack.uploadFile]', json)
  if (!json.ok) return undefined
  const response = await makePublic(json.file.id, params.token)
  // console.log('[Slack.uploadFile]', response)

  //https://files.slack.com/files-pri/{team_id}-{file_id}/{filename}?pub_secret={pub_secret}
  //https://slack-files.com/{team_id}-{file_id}-{pub_secret}
  const link = response.file.permalink_public.replace(
    'https://slack-files.com/',
    '',
  )
  const [teadId, fileId, pubSecret] = link.split('-')
  console.log('[Slack.uploadFile]', teadId, fileId, params.filename, pubSecret)
  return `https://files.slack.com/files-pri/${teadId}-${fileId}/${params.filename}?pub_secret=${pubSecret}`
}

export const uploadToSlack = async (params: UploadParams): SlackResponse => {
  try {
    console.log('[Slack.uploadToSlack]', params)

    let screenshotLink = ''
    let logLink = ''
    if (params.screenshotPath) {
      let uploadStatus = await uploadFile({
        filename: 'screenshot.jpg',
        path: params.screenshotPath,
        type: 'jpg',
        token: params.slack.token2,
        channel: params.slack.channel,
      })
      if (!uploadStatus)
        return {type: 'error', message: 'errorUploadScreenshot'}
      screenshotLink = uploadStatus
    }

    let uploadStatus = await uploadFile({
      filename: 'log.txt',
      path: params.logFilePath,
      type: 'txt',
      token: params.slack.token2,
      channel: params.slack.channel,
    })

    if (!uploadStatus) return {type: 'error', message: 'errorUploadLogFile'}
    logLink = uploadStatus

    console.log('[Slack.uploadToSlack]', logLink, screenshotLink)

    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `:point_down: Log (${Platform.OS.toUpperCase()})`,
          emoji: true,
        },
      },
    ]

    if (params.summary) {
      blocks.push({
        type: 'context',
        elements: [{type: 'plain_text', text: params.summary}],
      })
    }

    if (screenshotLink) {
      blocks.push({
        title: {
          type: 'plain_text',
          text: 'Screenshot',
        },
        type: 'image',
        alt_text: 'screenshot',
        image_url: screenshotLink,
      })
    }

    if (logLink) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `<${logLink}|Show logs>`,
        },
      })
    }

    let response = await fetch(`https://slack.com/api/chat.postMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.slack.token}`,
      },
      body: JSON.stringify({
        channel: params.slack.channel,
        attachments: [
          {
            color: '#f2c744',
            blocks: blocks,
          },
        ],
      }),
    })

    const json = await response.json()
    if (json.ok) return {type: 'success'}
    else
      console.log('[Slack.uploadToSlack]\n', JSON.stringify(json, undefined, 2))
    return {type: 'error', message: 'errorCreateMessage'}
  } catch (e) {
    console.log('[Slack.uploadToSlack.error]', e)
    throw e
  }
}
