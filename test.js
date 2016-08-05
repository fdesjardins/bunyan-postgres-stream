import test from 'ava';
import bunyanPostgresStream from './';

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

test('must end the connection pool on end()', t => {
	const stream = bunyanPostgresStream({
		connection: {},
		tableName: 'logs'
	});

	stream.end(() => {
		t.pass();
	});
});

test('errors without valid postgres connection', t => {
	const stream = bunyanPostgresStream({
		connection: {},
		tableName: 'logs'
	});

	t.throws(() => {
		stream._write({});
	});
});
