const Writable = require('stream').Writable
const pg = require('pg')

class LogStream extends Writable {
  constructor (options) {
    super(options)

    if (options.connection === undefined || options.tableName === undefined) {
      throw new Error('Invalid bunyan-postgres stream configuration')
    }

    if (options.connection.client && options.connection.client.makeKnex) {
      this.knex = options.connection
      this._write = this._writeKnex
    }

    if (typeof options.connection === 'object') {
      this.connection = options.connection
      this._write = this._writePgPool
      this.pool = new pg.Pool(this.connection)
    }

    this.tableName = options.tableName
  }

  _writeKnex (chunk, env, cb) {
    const content = JSON.parse(chunk.toString())
    this.knex.insert({
      name: content.name,
      level: content.level,
      hostname: content.hostname,
      msg: content.msg,
      pid: content.pid,
      time: content.time,
      content: JSON.stringify(content)
    })
    .into(this.tableName)
    .asCallback(cb)
  }

  writePgPool (client, content) {
    return client.query(`
      insert into ${this.tableName}
        (name, level, hostname, msg, pid, time, content)
      values (
        '${content.name}',
        '${content.level}',
        '${content.hostname}',
        '${content.msg}',
        '${content.pid}',
        '${content.time}',
        '${JSON.stringify(content)}'
      );
    `)
  }

  _writePgPool (chunk, env, cb) {
    const content = JSON.parse(chunk.toString())
    this.pool.connect().then(client => {
      return this.writePgPool(client, content).then(result => {
        cb(null, result.rows)
        client.release()
      })
    })
    .catch(err => cb(err))
  }

  end (cb) {
    if (this.pool) {
      return this.pool.end(cb)
    }
    cb()
  }
}

module.exports = (options = {}) => {
  return new LogStream(options)
}
