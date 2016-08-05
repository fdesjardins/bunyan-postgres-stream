# bunyan-postgres-stream [![Build Status](https://travis-ci.org/fdesjardins/bunyan-postgres-stream.svg?branch=master)](https://travis-ci.org/fdesjardins/bunyan-postgres-stream) [![Coverage Status](https://coveralls.io/repos/github/fdesjardins/bunyan-postgres-stream/badge.svg?branch=master)](https://coveralls.io/github/fdesjardins/bunyan-postgres-stream?branch=master)

> A bunyan stream for PostgreSQL

This module provides a bunyan stream to record logs to PostgreSQL. It maps the default log fields to table columns and also records the entire log message in a `jsonb` column to support custom fields.

## Install

```
$ npm install --save bunyan-postgres-stream
```

## Setup

This module requires a table to be created in your PostgreSQL database:

```sql
CREATE TABLE logs (name, level, hostname, msg, pid, time, content)
(
	id serial NOT NULL,
	name text,
	level integer,
	hostname text,
	msg text,
	pid integer,
	"time" timestamp with time zone,
	content jsonb,
	CONSTRAINT logs_pkey PRIMARY KEY (id)
)
```

You may also want to put indexes on some of the columns depending on how you are using the logs.

## Usage

```js
const bunyan = require('bunyan');
const bunyanPostgresStream = require('./');

const stream = bunyanPostgresStream({
	connection: {
		host: 'localhost',
		user: 'postgres',
		password: 'password',
		database: 'db'
	},
	tableName: 'logs'
});

const log = bunyan.createLogger({
	name: 'postgres stream',
	level: 'info',
	stream
});

log.info('something happened');

stream.end();
```


## API

### bunyanPostgresStream(options)

#### options

##### connection

Type: `object`

A valid node-postgres connection options object.

##### tableName

Type: `string`

The name of the table that will contain the logs.

## License

MIT © [Forrest Desjardins](https://github.com/fdesjardins)
