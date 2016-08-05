'use strict';

const Writable = require('stream').Writable;
const pg = require('pg');

class LogStream extends Writable {
	constructor(options) {
		super(options);

		this.connection = options.connection;
		this.tableName = options.tableName;

		if (!this.connection || !this.tableName) {
			throw new Error('Invalid bunyan-postgres stream configuration');
		}

		this.pool = new pg.Pool(this.connection);
	}

	_write(chunk, env, cb) {
		const content = JSON.parse(chunk.toString());

		this.pool.connect((err, client, done) => {
			if (err) {
				throw err;
			}

			client.query(`
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
				)`,
				(err, result) => {
					if (err) {
						throw err;
					}

					// release the client back to the pool
					done();

					cb(result);
				});
		});
	}

	end(cb) {
		this.pool.end(cb);
	}
}

module.exports = (options = {}) => {
	return new LogStream(options);
};
