const { Client, Pool } = require('pg')

const client = {
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'root',
    port: 5432,
};

const pool = new Pool(client);

module.exports = pool;
