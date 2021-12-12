import type {TrelloParams, TrelloResponse} from './types'
import rnfs from 'react-native-fs'

// get user token
//https://trello.com/1/authorize?expiration=never&scope=read,write,account&response_type=token&name=Server%20Token&key=9591e9521f0c60541c07c3eb8bdeff61

const uploadFile = async (params: {
  filename: string
  path: string
  type: string
  apikey: string
  token: string
  cardId: string
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
    toUrl: `https://api.trello.com/1/cards/${params.cardId}/attachments?key=${params.apikey}&token=${params.token}`,
  })
  let uploadResponse = await r.promise
  return uploadResponse.statusCode === 200
}

const createCard = async (params: {
  apikey: string
  token: string
  idList: string
  name: string
}): Promise<string | undefined> => {
  const createIssueResponse = await fetch(
    `https://api.trello.com/1/cards?idList=${params.idList}&name=${params.name}&key=${params.apikey}&token=${params.token}`,
    {method: 'POST'},
  )
  console.log('[Trello.createCard]', createIssueResponse.status)
  if (createIssueResponse.status !== 200) return undefined
  const card = await createIssueResponse.json()
  console.log('[Trello.createCard]', card.id)
  return card.id
}

export const uploadToTrello = async (params: TrelloParams): TrelloResponse => {
  try {
    console.log('[Trello.uploadToTrello]', params)
    const cardId = await createCard({
      apikey: params.trello.apiKey,
      token: params.trello.token,
      idList: params.trello.listId,
      name: params.summary,
    })
    if (!cardId) return {type: 'error', message: 'errorCreateMessage'}
    if (params.screenshotPath) {
      const response = await uploadFile({
        apikey: params.trello.apiKey,
        token: params.trello.token,
        cardId: cardId,
        filename: 'screenshot',
        type: 'jpg',
        path: params.screenshotPath,
      })
      if (!response) return {type: 'error', message: 'errorUploadScreenshot'}
    }

    const response = await uploadFile({
      apikey: params.trello.apiKey,
      token: params.trello.token,
      cardId: cardId,
      filename: 'log',
      type: 'tsx',
      path: params.logFilePath,
    })
    if (!response) return {type: 'error', message: 'errorUploadLogFile'}
    return {type: 'success'}
  } catch (e) {
    console.log('[Trello.uploadToTrello]', e)
    throw e
  }
}
