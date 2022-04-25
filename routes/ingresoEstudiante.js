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

        if (request.id_tipo_usuario == 1) {

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
                        res.send(envio);
                        return;
                    }

                    

                    prom2 = quieryCreator(
                        `INSERT INTO public.estado_semestre(documento, codigo, fecha_ingreso, cursando)
                        values('${request.documento}','${request.codigo}','${request.fecha_ingreso}','${request.cursando}');`
                    )
                        .then((result) => {
                            return result;
                        })
                        .catch((err) => {
                            return "Error conexion BD Tabla estado semestre: " + err;
                        });

                    prom3 = quieryCreator(
                        `INSERT INTO public.datos(documento, documento_nacional)
                        values('${request.documento}','${request.documento_nacional}');`
                    )
                        .then((result) => {
                            return result;
                        })
                        .catch((err) => {
                            return "Error conexion BD Tabla datos: " + err;
                        });
                    
                    prom4 = quieryCreator(
                        `INSERT INTO public.informacion_academica(documento)
                        values('${request.documento}');`
                    )
                        .then((result) => {
                            return result;
                        })
                        .catch((err) => {
                            return "Error conexion BD Tabla informacion academica: " + err;
                        });    

                    prom5 = quieryCreator(
                        `INSERT INTO public.perfil(id_tipo_usuario, documento) 
                        values('${request.id_tipo_usuario}','${request.documento}')`
                    )
                        .then((result) => {
                            return result;
                        })
                        .catch((err) => {
                            return "Error conexion BD Tabla perfil: " + err;
                        });


                    Promise.all([prom2, prom3,prom4, prom5]).then(([r2, r3, r4, r5]) => {
                        if (r2.command && r3.command && r4.command && r5.command && result.command) {
                            return res.send({status: true});
                        } else {
                            var resp = {status: r2 + "\n" + r3 + "\n" + r4 + "\n" + r5 + "\n" + result};
                            return res.send(resp);
                        }

                    });
                })
                .catch((err) => {
                    return res.send({status:"Error conexion BD Tabla usuarios: " + err});
                });
        } else {
            return res.send({status:"Se requiere un usuario tipo estudiante"});
        }
    })
    .get(sendNull)
    .put(sendNull)
    .delete(sendNull);


module.exports = docenteRouter;