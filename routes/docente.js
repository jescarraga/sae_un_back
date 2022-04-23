const express = require('express');
const bodyParser = require('body-parser');
const database = require('../database');

const docenteRouter = express.Router();


/*
    Allows the creation of querys and responses with promise to handle it
*/
function quieryCreator(theQuery){
    return (
        new Promise((resolve, reject) => {
            database.query(theQuery, (err, res1) => {
                if(err) resolve(err);
                else resolve(res1);   
            });
        })
    );
}

/*
    Prototype of function that responses with a NULL value
*/
sendNull = (req, res, next) => {
    res.send(null);
}


docenteRouter.use(bodyParser.json());

docenteRouter.route('/docente')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .post((req, res, next) => {
        var solicitude = req.body;
        
        res.send('will put? something');
    })
    .get(sendNull)
    .put(sendNull)
    .delete(sendNull);


module.exports = docenteRouter;