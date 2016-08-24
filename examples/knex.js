const bunyan = require('bunyan');
const bunyanPostgresStream = require('./');
const knex = require('knex')

const db = knex({
	client: 'pg',
	connection: {
		host: 'localhost',
		user: 'postgres',
		password: 'password',
		database: 'db'
	}
})

const stream = bunyanPostgresStream({
	connection: db,
	tableName: 'logs'
});

const log = bunyan.createLogger({
	name: 'postgres stream',
	level: 'info',
	stream
});

log.info('something happened');
