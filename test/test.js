const { describe, it } = require('mocha')
const knex = require('knex')
const bunyan = require('bunyan')
const bunyanPostgresStream = require('../')
const config = require('./config')

const fixture = {
  name: 'name',
  level: 1,
  hostname: 'hostname',
  msg: 'msg',
  pid: 1,
  time: new Date()
}
fixture.content = JSON.stringify(fixture)

describe('bunyan-postgres-stream', () => {
  it('should provide pg connection configuration', done => {
    try {
      bunyanPostgresStream({
        tableName: 'test'
      })
    } catch (err) {
      return done()
    }
    done(new Error('should have thrown an error'))
  })

  it('should provide a tableName', done => {
    try {
      bunyanPostgresStream({
        conntection: {}
      })
    } catch (err) {
      return done()
    }
    done(new Error('should have thrown an error'))
  })

  it('should end the connection pool on end()', done => {
    const stream = bunyanPostgresStream({
      connection: {},
      tableName: 'logs'
    })
    stream.end(() => done())
  })

  it('should accept a knex instance', done => {
    const db = knex(config)
    const stream = bunyanPostgresStream({
      connection: db,
      tableName: 'logs'
    })
    stream.end(() => done())
  })

  it('should write to the database correctly using pgPool', done => {
    const stream = bunyanPostgresStream({
      connection: config.connection,
      tableName: 'logs'
    })

    const log = bunyan.createLogger({
      name: 'test logger',
      stream
    })

    const db = knex(config)
    const uniqueMessage = `unique message: ${Math.random()}`
    log.info(uniqueMessage)

    stream.end(() => {
      db('logs')
        .first('*')
        .where('msg', '=', uniqueMessage)
        .then(result => {
          if (result) {
            done()
          } else {
            done(new Error('error writing with pgPool'))
          }
        })
        .catch(err => done(err))
        .finally(() => db.destroy())
    })
  })

  it('should call the writePgPool callback', done => {
    const stream = bunyanPostgresStream({
      connection: config.connection,
      tableName: 'logs'
    })

    stream._write(JSON.stringify(fixture), null, done)
    stream.end()
  })

  it('should call the writeKnex callback', done => {
    const db = knex(config)
    const stream = bunyanPostgresStream({
      connection: db,
      tableName: 'logs'
    })

    stream._write(JSON.stringify(fixture), null, () => {
      db.destroy()
      done()
    })
  })

  it('should write to the database using knex', done => {
    const db = knex(config)
    const stream = bunyanPostgresStream({
      connection: db,
      tableName: 'logs'
    })

    const log = bunyan.createLogger({
      name: 'test logger',
      stream
    })

    const uniqueMessage = `unique message: ${Math.random()}`
    log.info(uniqueMessage)

    stream.end(() => {
      db('logs')
        .first('*')
        .where('msg', '=', uniqueMessage)
        .then(result => {
          if (result) {
            done()
          } else {
            done(new Error('error writing with pgPool'))
          }
        })
        .catch(err => done(err))
        .finally(() => db.destroy())
    })
  })

  it('should write every log message before draining the connection pool', done => {
    const stream = bunyanPostgresStream({
      connection: config.connection,
      tableName: 'logs'
    })

    const log = bunyan.createLogger({
      name: 'test logger',
      stream
    })

    const db = knex(config)
    const tag = 'before draining pool'

    db.raw(`delete from logs where msg like :tag`, { tag: `${tag}%` })
      .then(result => {
        for (let i = 0; i < 500; i += 1) {
          log.info(`${tag}: ${i}`)
        }

        return new Promise((resolve, reject) => {
          stream.end(() => {
            db.raw(`select count(*) from logs where msg like :tag`, {
              tag: `${tag}%`
            })
              .then(result => resolve(result.rows[0]))
              .catch(err => reject(err))
          })
        })
      })
      .then(result => {
        if (result.count === '500') {
          done()
        } else {
          done(new Error("didn't write every message"))
        }
      })
      .catch(err => done(err))
      .finally(() => db.destroy())
  })
})
