const { Client, Pool } = require('pg')

const client = {
    user: 'uwwxvblzcigqja',
    host: 'ec2-23-20-224-166.compute-1.amazonaws.com',
    database: 'd8u9dot11hatss',
    password: 'c44db1ce5d4d5415659ce7452d1d75eb32853826cc278798e8b6c60d2280916f',
    port: 5432,
    ssl:{
        rejectUnauthorized:false,
    }
};

const pool = new Pool(client);
module.exports = pool;
