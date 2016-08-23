import test from 'ava';
import knex from 'knex';
import bunyan from 'bunyan';
import bunyanPostgresStream from '../';
import config from './config';

const fixture = {
	name: 'name',
	level: 1,
	hostname: 'hostname',
	msg: 'msg',
	pid: 1,
	time: new Date()
};
fixture.content = JSON.stringify(fixture);

test('must provide pg connection configuration', t => {
	t.throws(() => {
		bunyanPostgresStream({
			tableName: 'test'
		});
	});
});

test('must provide tableName', t => {
	t.throws(() => {
		bunyanPostgresStream({
			connection: {}
		});
	});
});

test.cb('must end the connection pool on end()', t => {
	const stream = bunyanPostgresStream({
		connection: {},
		tableName: 'logs'
	});

	stream.end(t.end);
});

test.cb('throws an error if using invalid postgres config', t => {
	const stream = bunyanPostgresStream({
		connection: {
			host: 'badhost'
		},
		tableName: 'logs'
	});

	stream._write(JSON.stringify(fixture), null, err => {
		if (err) {
			t.pass();
			t.end();
		}
	});
});

test.cb('accepts a knex instance', t => {
	const db = knex(config);
	const stream = bunyanPostgresStream({
		connection: db,
		tableName: 'logs'
	});

	stream.end(t.end);
});

test.cb('writes to the database using pgPool', t => {
	const stream = bunyanPostgresStream({
		connection: config.connection,
		tableName: 'logs'
	});

	const log = bunyan.createLogger({
		name: 'test logger',
		stream
	});

	const db = knex(config);
	const uniqueMessage = `unique message: ${Math.random()}`;
	log.info(uniqueMessage);

	t.plan(1);
	setTimeout(() => {
		stream.end(() => {
			db('logs')
				.first('*')
				.where('msg', '=', uniqueMessage)
				.then(result => {
					if (result) {
						t.pass();
					}
					t.end();
				});
		});
	}, 1000);
});

test.cb('calls the writePgPool callback', t => {
	const stream = bunyanPostgresStream({
		connection: config.connection,
		tableName: 'logs'
	});

	stream._write(JSON.stringify(fixture), null, t.end);
});

test.cb('calls the writeKnex callback', t => {
	const db = knex(config);
	const stream = bunyanPostgresStream({
		connection: db,
		tableName: 'logs'
	});

	stream._write(JSON.stringify(fixture), null, t.end);
});

test.cb('writes to the database using a knex instance', t => {
	const db = knex(config);
	const stream = bunyanPostgresStream({
		connection: db,
		tableName: 'logs'
	});

	const log = bunyan.createLogger({
		name: 'test logger',
		stream
	});

	const uniqueMessage = `unique message: ${Math.random()}`;
	log.info(uniqueMessage);

	setTimeout(() => {
		stream.end(() => {
			db('logs')
				.first('*')
				.where('msg', '=', uniqueMessage)
				.then(result => {
					if (result) {
						t.pass();
					}
					t.end();
				});
		});
	}, 1000);
});
