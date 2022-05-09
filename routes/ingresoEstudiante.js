const express = require('express');
const bodyParser = require('body-parser');
const queryCreator = require('../queryUtilities/queryCreator');
const sendNull = require('../queryUtilities/queryNull');

//const { jsonp } = require('express/lib/response');

const ingresoEstudianteRouter = express.Router();

// the system is going to use text fromat
ingresoEstudianteRouter.use(bodyParser.json());
var getQuery = `SELECT codigo, nombre_programa_curricular FROM public.programas_curriculares;`;

ingresoEstudianteRouter.route('/ingresoEstudiante')
    .all((req, res, next) => {
        res.statusCode = 200;
        next();
    })
    .post((req, res, next) => {
        var request = req.body;
        console.log(req.body);

        if (request.id_tipo_usuario == 1) {

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

                    if(!result.command){
                        var envio = {status:"No es posible ingresar un usuario con esos datos: "+ result.detail};
                        res.send(envio);
                        return;
                    }

                    

                    prom2 = queryCreator(
                        `INSERT INTO public.estado_semestre(documento, codigo, fecha_ingreso, cursando)
                        values('${request.documento}','${request.codigo}','${request.fecha_ingreso}','${request.cursando}');`
                    )
                        .then((result) => {
                            return result;
                        })
                        .catch((err) => {
                            return "Error conexion BD Tabla estado semestre: " + err;
                        });

                    prom3 = queryCreator(
                        `INSERT INTO public.datos(documento, documento_nacional)
                        values('${request.documento}','${request.documento_nacional}');`
                    )
                        .then((result) => {
                            return result;
                        })
                        .catch((err) => {
                            return "Error conexion BD Tabla datos: " + err;
                        });
                    
                    prom4 = queryCreator(
                        `INSERT INTO public.informacion_academica(documento)
                        values('${request.documento}');`
                    )
                        .then((result) => {
                            return result;
                        })
                        .catch((err) => {
                            return "Error conexion BD Tabla informacion academica: " + err;
                        });    

                    prom5 = queryCreator(
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
    .get(async (req, res, next) => {
        var resultquery = await queryCreator(getQuery);
        res.send(resultquery.rows.map((r) => { return [r.codigo, r.nombre_programa_curricular] }));
    })
    .put(sendNull)
    .delete(sendNull);


module.exports = ingresoEstudianteRouter;