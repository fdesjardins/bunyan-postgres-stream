module.exports = {
  client: 'pg',
  connection: {
    adapter: 'postgresql',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'test',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password'
  }
}
