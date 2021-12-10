import type {JiraIssue, JiraIssueResponse} from './types'
import rnfs from 'react-native-fs'
import {Buffer} from 'buffer'

interface Issue {
  id: string
  key: string
}

const createIssue = async (
  authorization: string,
  params: JiraIssue,
): Promise<Issue | undefined> => {
  const createIssueResponse = await fetch(
    `https://adverto-plan.atlassian.net/rest/api/3/issue`,
    {
      method: 'POST',
      headers: {
        Authorization: authorization,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          project: {key: params.jira.project},
          summary: params.jira.summary,
          issuetype: {name: 'Bug'},
        },
      }),
    },
  )
  if (createIssueResponse.status !== 201) return undefined
  const issue = await createIssueResponse.json()
  console.log('[Jira.createJiraIssue]', issue)
  return issue
}

const uploadFile = async (params: {
  filename: string
  path: string
  type: string
  issue: string
  authorization: string
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
    toUrl: `https://adverto-plan.atlassian.net/rest/api/3/issue/${params.issue}/attachments`,
    headers: {
      Authorization: params.authorization,
      Accept: 'application/json',
      'X-Atlassian-Token': 'no-check',
    },
  })
  let uploadResponse = await r.promise
  console.log('[Jira.uploadFile]', uploadResponse.statusCode)
  return uploadResponse.statusCode
}

export const createJiraIssue = async (params: JiraIssue): JiraIssueResponse => {
  if (!params.jira) return 'success'
  try {
    const authorization = `Basic ${Buffer.from(
      `${params.jira.email}:${params.jira.token}`,
    ).toString('base64')}`
    console.log('[Slack.uploadToSlack]', authorization, params)

    const issue = await createIssue(authorization, params)
    if (!issue) return {type: 'error', message: 'errorCreateIssue'}

    let uploadStatus = await uploadFile({
      filename: 'log.txt',
      path: params.logFilePath,
      issue: issue.key,
      authorization,
      type: 'txt',
    })

    if (uploadStatus !== 200)
      return {type: 'error', message: 'errorUploadLogFile'}

    if (params.screenshotPath) {
      uploadStatus = await uploadFile({
        filename: 'screenshot.jpg',
        path: params.screenshotPath,
        issue: issue.key,
        authorization,
        type: 'jpg',
      })
      if (uploadStatus !== 200)
        return {type: 'error', message: 'errorUploadScreenshot'}
    }

    return {type: 'success', issue: issue.key}
  } catch (e) {
    return {type: 'error', message: e as Error}
  }
}
