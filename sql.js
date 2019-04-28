const mysql = require('mysql')

/**
 * TODO(developer): specify SQL connection details
 */
const connectionName = process.env.INSTANCE_CONNECTION_NAME
const dbUser = process.env.SQL_USER
const dbPassword = process.env.SQL_PASSWORD
const dbName = process.env.SQL_HOME


const mysqlConfig = {
  connectionLimit: 1,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  charset: 'UTF8MB4_GENERAL_CI',
}

if (process.env.NODE_ENV === 'production') {
  mysqlConfig.socketPath = `/cloudsql/${connectionName}`
} 

// Connection pools reuse connections between invocations,
// and handle dropped or expired connections automatically.
let mysqlPool

exports.insertData = (data) => {
  if (!mysqlPool) {
    mysqlPool = mysql.createPool(mysqlConfig)
  }

  mysqlPool.query('INSERT INTO cards SET ?', data, (err, results) => {
    if (err) {
      throw new Error(err)
    }
    console.log(results)
  })
}
