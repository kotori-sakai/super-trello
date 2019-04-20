const { insertData } = require('./sql')
const { getUpdatedCardData } = require('./trello')

exports.trackTrello = async (req, res) => {
  const data = await getUpdatedCardData()
  if (!data) {
    return
  }
  console.log(data)
  
  try {
    for (const { name, subject, action, pomodoro, dateLastActivity, id } of data) {
      const insertedData = {
        name,
        subject,
        action,
        pomodoro,
        terminated_date: new Date(dateLastActivity),
        original_id: id
      }
      insertData(insertedData)
    }
    res.send(JSON.stringify(data))
  } catch (err) {
    res.status(500).send(err)
  }
} 
