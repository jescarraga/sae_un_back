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
        next();
    })
    .post((req, res, next) => {
        var request = req.body;

        if (request.id_tipo_usuario == 2) {

            quieryCreator(
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

                    if(!result.command){
                        var envio = {status:"No es posible ingresar un usuario con esos datos: "+ result.detail};
                        return res.send(envio);
                    }

                    prom2 = quieryCreator(
                        `INSERT INTO public.docente(documento, id_departamento) values('${request.documento}','${request.id_departamento}');`
                    )
                        .then((result) => {
                            return result;
                        })
                        .catch((err) => {
                            return "Error conexion BD Tabla docente: " + err;
                        });

                    prom3 = quieryCreator(
                        `INSERT INTO public.perfil(id_tipo_usuario, documento) values('${request.id_tipo_usuario}','${request.documento}')`
                    )
                        .then((result) => {
                            return result;
                        })
                        .catch((err) => {
                            return "Error conexion BD Tabla docente: " + err;
                        });


                    Promise.all([prom2, prom3]).then(([r1, r2]) => {
                        if (r1.command && r2.command && result.command) {
                            return res.send({status: true});
                        } else {
                            var resp = {status: r1 + "\n" + r2 + "\n" + result};
                            return res.send(resp);
                        }

                    });
                })
                .catch((err) => {
                    return res.send({status:"Error conexion BD Tabla usuarios: " + err});
                });
        } else {
            return res.send({status:"Se requiere un usuario tipo docente"});
        }
    })
    .get((req, res, next) => {
        quieryCreator(`SELECT nombre_departamento FROM public.departamento;`)
        .then((result) => {res.send(result.rows.map((r)=>{return r.nombre_departamento}));});
    })
    .put(sendNull)
    .delete(sendNull);


module.exports = docenteRouter;