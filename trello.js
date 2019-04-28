const request = require('request-promise')
 
async function fetchBoards() {
  const options = {
    method: 'GET',
    url: 'https://api.trello.com/1/members/me/boards',
    qs: {
      key: process.env.TRELLO_APIKEY,
      token: process.env.TRELLO_TOKEN,
    },
    headers: {
      'User-Agent': 'Request-Promise'
    }
  }
  
  try {
    const boards = await request(options)
    return boards
  } catch (err) {
    throw new Error(err)
  }
}

async function fetchActions(boardId) {
 const options = {
    method: 'GET',
    url: `https://api.trello.com/1/boards/${boardId}/actions`,
    qs: {
      limit: 5,
      key: process.env.TRELLO_APIKEY,
      token: process.env.TRELLO_TOKEN
    },
    headers: {
      'User-Agent': 'Request-Promise'
    }
  }
  
  try {
    const actions = await request(options)
    return actions
  } catch (err) {
    throw new Error(err)
  }
}

async function fetchCard(id) {
  const options = {
    method: 'GET',
    url: `https://api.trello.com/1/cards/${id}`,
    qs: {
      key: process.env.TRELLO_APIKEY,
      token: process.env.TRELLO_TOKEN
    },
    headers: {
      'User-Agent': 'Request-Promise'
    }
  }
  
  try {
    const card = await request(options)
    return card
  } catch (err) {
    throw new Error(err)
  }
}

function isActiveData(actionDate, interval) {
  return (new Date().getTime() - new Date(actionDate).getTime() < interval)
}

exports.getUpdatedCardData = async () => {
  const boards = JSON.parse(await fetchBoards())
  const board = await boards[0]
  const actions = JSON.parse(await fetchActions(board.id))
  let data = []

  for (const action of actions) {
    if (!isActiveData(action.date, 60000)) {
      console.log('Data collection has done.')
      return data
    }
    
    switch(action.type) {
    case 'updateCard':
      if (!action.data.listAfter || !action.data.listBefore) {
        console.log('SKIP: This action is not related with working time.')
        break
      }

      const cardName = action.data.card.name
      const listAfterName = action.data.listAfter.name
      const listBeforeName = action.data.listBefore.name
      console.log(`${cardName} moved from ${listBeforeName} to ${listAfterName}.`)

      if (listAfterName === 'DONE') {
        const cardId = action.data.card.id
        const card = JSON.parse(await fetchCard(cardId))
        for (const label of card.labels) {
          if (label.color) {
            card.subject = label.name
          } else {
            card.action = label.name
          }
        }
        
        let pomodoro = card.name.split(' ')[0]
        if (isNaN(parseFloat(pomodoro))) {
          console.log('SKIP: This action does not have working time.')
          break
        }
        pomodoro = parseFloat(pomodoro)
        data.push(Object.assign({ pomodoro }, card))
      }
    default:
      break
    }
  }
  
  return data
}
