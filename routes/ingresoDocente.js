const express = require('express');
const bodyParser = require('body-parser');
const database = require('../database');

const docenteRouter = express.Router();


/*
    Allows the creation of querys and responses with promise to handle it
*/
function quieryCreator(theQuery) {
    return (
        new Promise((resolve, reject) => {
            database.query(theQuery, (err, res1) => {
                if (err) resolve(err);
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
        var request = req.body;

        if (request.id_tipo_usuario == 2) {

            prom1 = quieryCreator(
                `INSERT INTO public.usuario(documento, nombres, apellidos, usuario_un, estado, sexo) 
                    VALUES (
                        '${request.documento}', 
                        '${request.nombres}', 
                        '${request.apellidos}', 
                        '${request.usuario_un}', 
                        '${request.estado}', 
                        '${request.sexo}');`
            )
                .then((result) => {
                    prom2 = quieryCreator(
                        `INSERT INTO public.docente(documento, id_departamento) values('${request.documento}','${request.id_departamento}');`
                    )
                        .then((result) => {
                            return result.command;
                        })
                        .catch(() => {
                            return null;
                        });

                    prom3 = quieryCreator(
                        `INSERT INTO public.perfil(id_tipo_usuario, documento) values('${request.id_tipo_usuario}','${request.documento}')`
                    )
                        .then((result) => {
                            return result.command;
                        })
                        .catch(() => {
                            return null;
                        });


                    Promise.all([prom2, prom3]).then(([r1, r2]) => {
                        if(r1 && r2 && result.command){
                            res.send('Successful inserted');
                        }else{
                            res.send(null);
                        }
                        
                    });
                })
                .catch(() => {
                    return null;
                });
        } else {
            res.send(null);
        }
    })
    .get(sendNull)
    .put(sendNull)
    .delete(sendNull);


module.exports = docenteRouter;