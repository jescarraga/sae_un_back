const express = require('express');
const bodyParser = require('body-parser');
const queryCreator = require('../queryUtilities/queryCreator');
const sendNull = require('../queryUtilities/queryNull');

const docenteRouter = express.Router();

docenteRouter.use(bodyParser.json());
var getQuery = `SELECT id_departamento, nombre_departamento FROM public.departamento;`;

docenteRouter.route('/docente')
    .all((req, res, next) => {
        res.statusCode = 200;
        next();
    })
    .post((req, res, next) => {
        var request = req.body;
        var departaments = [];

        queryCreator(getQuery).then((result) => {
            departaments = result.rows.map((r) => { return r.id_departamento });
            if (request.id_tipo_usuario == 2 && departaments.includes(+request.id_departamento)) {

                queryCreator(
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

                        if (!result.command) {
                            var envio = { status: "No es posible ingresar un usuario con esos datos: " + result.detail };
                            return res.send(envio);
                        }

                        prom2 = queryCreator(
                            `INSERT INTO public.docente(documento, id_departamento) values('${request.documento}','${request.id_departamento}');`
                        )
                            .then((result) => {
                                return result;
                            })
                            .catch((err) => {
                                return "Error conexion BD Tabla docente: " + err;
                            });

                        prom3 = queryCreator(
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
                                return res.send({ status: true });
                            } else {
                                var resp = { status: r1 + "\n" + r2 + "\n" + result };
                                return res.send(resp);
                            }

                        });
                    })
                    .catch((err) => {
                        return res.send({ status: "Error conexion BD Tabla usuarios: " + err });
                    });
            } else {
                return res.send({ status: "tipo usuario: " +  request.id_tipo_usuario + " o departamento: "+ request.id_departamento+" -> no validos"});
            }
        });
    })
    .get((req, res, next) => {
        queryCreator(getQuery).then((result) => { res.send(result.rows.map((r) => { return [r.id_departamento, r.nombre_departamento] })) });
    })
    .put(sendNull)
    .delete(sendNull);


module.exports = docenteRouter;