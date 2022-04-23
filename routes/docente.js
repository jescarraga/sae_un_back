const express = require('express');
const bodyParser = require('body-parser');
const database = require('../database');

const docenteRouter = express.Router();

function quieryCreator(theQuery){
    return (
        new Promise((resolve, reject) => {
            database.query(theQuery, (err, res1) => {
                if(err){
                    resolve(err);
                }else{
                    resolve(res1);
                }
                
            })
        })
    );
}


docenteRouter.use(bodyParser.json());

docenteRouter.route('/docente')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res, next) => {
        quieryCreator('select * from public.usuario;')
        .then((datas) => { res.end(JSON.stringify(datas.rows)) });
    })
    .post((req, res, next) => {
        //Codigo mega chambón no se hace nunca solo es un test perdóname diosito
        res.end('will put? something');
    })
    .put((req, res, next) => {
        res.end('will put? something');
    })
    .delete((req, res, next) => {
        res.end('will delete something');
    });


module.exports = docenteRouter;