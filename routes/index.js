const express = require('express');
const bodyParser = require('body-parser');
const database = require('../database');

const indexRouter = express.Router();

indexRouter.use(bodyParser.json());

indexRouter.route('/')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res, next) => {
    
        const data = () => {
            return (
                new Promise((resolve, reject) => {
                    database.query('select * from public.usuario;', (err, res1) => {
                        if(err){
                            resolve(err);
                        }else{
                            resolve(res1);
                        }
                        
                    })
                })
            );
        }

        data().then((datas) => { res.end(JSON.stringify(datas)) });
    })
    .post((req, res, next) => {
        //Codigo mega chambón no se hace nunca solo es un test perdóname diosito

        var miq = req.body.miquery;
        const data = () => {
            return (
                new Promise((resolve, reject) => {
                    database.query(miq, (err, res1) => {
                        resolve(res1);
                    })
                })
            );
        }

        data()
        .then((datas) => {res.end(JSON.stringify(datas.rows))})
        .catch((err) => res.end("no funciona, error: "+ err));
    })
    .put((req, res, next) => {
        res.end('will put? something' + req.body.miquery + '  ' + req.body.description);
    })
    .delete((req, res, next) => {
        res.end('will delete something' + req.body.name + '  ' + req.body.description);
    });


module.exports = indexRouter;