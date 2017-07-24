# bunyan-postgres-stream

[![Build Status](https://travis-ci.org/fdesjardins/bunyan-postgres-stream.svg?branch=master)](https://travis-ci.org/fdesjardins/bunyan-postgres-stream)
[![NPM Version](http://img.shields.io/npm/v/bunyan-postgres-stream.svg?style=flat)](https://www.npmjs.org/package/bunyan-postgres-stream)
[![Coverage Status](https://coveralls.io/repos/github/fdesjardins/bunyan-postgres-stream/badge.svg?branch=master)](https://coveralls.io/github/fdesjardins/bunyan-postgres-stream?branch=master)

Store your Bunyan logs in PostgreSQL.

This module creates a Bunyan stream that maps the default log fields to table columns and also records the entire log message in a `jsonb` column to support your custom fields.

Requires PostgreSQL 9.4 or above for use with `jsonb` column types.

## Install

```
$ npm install --save bunyan-postgres-stream
```

## Usage

First, create the table you want to store your logs in:
```sql
create table if not exists "public"."logs" (
  "id" serial primary key,
  "name" text,
  "level" integer,
  "hostname" text,
  "msg" text,
  "pid" integer,
  "time" timestamptz,
  "content" jsonb
)
```

Then, use the package as a Bunyan stream:

```js
const bunyan = require('bunyan')
const bunyanPostgresStream = require('./')

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
```

## API

### bunyanPostgresStream(options)

#### options

##### connection

Type: `object`

One of the following:
- a valid node-postgres connection options object
- an initialized knex.js instance (see [examples/knex.js](./examples/knex.js))

##### tableName

Type: `string`

The name of the table that will contain the logs.

## Contributing

Pull requests welcome.

## License

MIT © [Forrest Desjardins](https://github.com/fdesjardins)
