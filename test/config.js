module.exports = {
  client: 'pg',
  connection: {
    adapter: 'postgresql',
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
  }
}
