const bunyan = require('bunyan')
const bunyanPostgresStream = require('../')

const stream = bunyanPostgresStream({
  connection: {
    host: 'localhost',
    user: 'postgres',
    password: 'password',
    database: 'db'
  },
  tableName: 'logs'
})

const log = bunyan.createLogger({
  name: 'postgres stream',
  level: 'info',
  stream
})

log.info('something happened')

// explicity dispose of the database connection pool
stream.end()
