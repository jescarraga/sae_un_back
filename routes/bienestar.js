const express = require('express');
const bodyParser = require('body-parser');
const database = require('../database');
const axios = require('axios');


const indexRouter = express.Router();

indexRouter.use(bodyParser.text());

indexRouter.route('/bienestar')
    .all((req, res, next) => {
        res.statusCode = 200;
        //res.setHeader('Content-Type', 'application/json');
        next();
    })
    .get((req, res, next) => {
        documento = req.query.documento;
        const data = (documento) => {
            return (
                new Promise((resolve, reject) => {
                    database.query(`select * from public.usuario where documento = '${documento}';
                    select * from public.perfil where documento = '${documento}';`, (err, res1) => {
                        if (err) {
                            res.status(500);
                            resolve(err);
                        } else {
                            //console.log(typeof(res1[0]))
                            //console.log(res1)
                            //console.log(res1[0].rowCount)
                            if (res1[0].rowCount>0){
                                resolve(Object.assign(res1[0].rows[0], res1[1].rows[0]));
                            } else {
                                res.status(404);
                                resolve({"message": "User not found"})
                            }
                            
                        }
                    });
                })
            );
        }

        data(documento).then((datas) => { res.end(JSON.stringify(datas)) });

        
    })
    .post((req, res, next) => {

        var toInsert = JSON.parse(req.body);
        console.log(toInsert);
        const data = (toInsert) => {
            return (
                new Promise((resolve, reject) => {
                    database.query(`INSERT INTO public.usuario(
                        documento, nombres, apellidos, usuario_un, estado, sexo)
                        VALUES ('${toInsert.documento}', '${toInsert.nombres}', '${toInsert.apellidos}', '${toInsert.usuario_un}', ${toInsert.estado}, ${toInsert.sexo});
                        INSERT INTO public.perfil(
                            id_tipo_usuario, documento)
                            VALUES (3 , '${toInsert.documento}');`, (err, res1) => {
                        if (err) {
                            res.status(500);
                            resolve(err);
                        }
                        var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
                        console.log(fullUrl);
                        axios.get(`${fullUrl}?documento=${toInsert.documento}`).then(function (response) {
                            // handle success
                            resolve(response.data);
                          })
                          .catch(function (error) {
                            // handle error
                            res.status(500);
                            resolve(error);
                          })
                        
                    })
                })
            );
        }

        data(toInsert)
            .then((datas) => { res.send(JSON.stringify(datas)) })
            .catch((err) => {res.end("no funciona, error: " + err); res.status(500)}); 
            
    })
    .put((req, res, next) => {
        res.end('will put? something' + req.body.miquery + '  ' + req.body.description);
    })
    .delete((req, res, next) => {
        res.end('will delete something' + req.body.name + '  ' + req.body.description);
    });


module.exports = indexRouter;