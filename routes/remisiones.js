const express = require('express');
const bodyParser = require('body-parser');
const queryCreator = require('../queryUtilities/queryCreator');
const sendNull = require('../queryUtilities/queryNull');

const remisionesRouter = express.Router();
remisionesRouter.use(bodyParser.json());

remisionesRouter.route('/remisiones')
    .all((req, res, next) => {
        res.statusCode = 200;
        next();
    })
    .post(docenteInsertarRemision)
    .get(obtenerTiposDeRemisiones)
    .put(sendNull)
    .delete(sendNull);



async function docenteInsertarRemision(req, res, next) {
    var request = req.body;
    var res1 = await queryCreator(`select codigo_plan FROM public.tutores where documento_estudiante = '${request.documento_estudiante}' and documento_docente = '${request.documento_docente}';`);
    var codigos_estudiante = res1.rows.map((r) => { return r.codigo_plan });

    if (codigos_estudiante.includes(+request.codigo_plan)) {
        var insertRemision = await queryCreator(
            `CALL public.insert_remision(
                '${request.documento_docente}',
                '${request.documento_estudiante}',
                ${request.codigo_plan},
                '${request.motivo_remision}',
                ${request.codigo_tipo_remision});`
        );

        if (!insertRemision.command) {
            var envio = { status: "No es posible ingresar una remision con esos datos: " + insertRemision };
            return res.send(envio);
        } else {
            var resp = { status: true };
            return res.send(resp);
        }
    }
    else {
        res.send({ status: "ese estudiante no tiene ese plan asociado con ese docente" });
    }

}

async function obtenerTiposDeRemisiones(req, res, next) {
    var consulta = await queryCreator(`select * FROM public.tipo_remisiones;`);
    var res1 = consulta.rows;
    return res.send(res1);
}

async function docenteObtenerRemisionesEstudiante(req, res, next){
    var res1 = await queryCreator(`select * FROM public.remisiones where documento_estudiante 
    = '${request.documento_estudiante}' and documento_docente = '${request.documento_docente}';`);


    var codigos_estudiante = res1.rows.map((r) => { return r.codigo_plan });

    if (codigos_estudiante.includes(+request.codigo_plan)) {
        var insertRemision = await queryCreator(
            `CALL public.insert_remision(
                '${request.documento_docente}',
                '${request.documento_estudiante}',
                ${request.codigo_plan},
                '${request.motivo_remision}');`
        );

        if (!insertRemision.command) {
            var envio = { status: "No es posible ingresar una observacion con esos datos: " + insertRemision };
            return res.send(envio);
        } else {
            var resp = { status: true };
            return res.send(resp);
        }
    }
    else {
        res.send({ status: "ese estudiante no tiene ese plan asociado con ese docente" });
    }
}


remisionesRouter.route('/observaciones/all')
    .all((req, res, next) => {
        res.statusCode = 200;
        next();
    })
    .post(sendNull)
    .get(async (req, res, next) => {

        if (!req.query.busqueda) {
            var selectEstudiantes = await queryCreator(
                `select * from public.all_observaciones()`
            );


            for (let index = 0; index < selectEstudiantes.rows.length; index++) {
                var lista = [];
                selectEstudiantes.rows[index].observaciones.forEach((s) => { lista.push(s.split(':')) });
                selectEstudiantes.rows[index].observaciones = lista;
            }


            res.send(selectEstudiantes.rows);
        } else {
            var selectEstudiantes = await queryCreator(
                `select * from public.all_observaciones() where 
                    documento_docente like '%${req.query.busqueda}%' or 
                    documento_estudiante like '%${req.query.busqueda}%' or
                    nombres like '%${req.query.busqueda}%' or 
                    apellidos like '%${req.query.busqueda}%' or
                    nombres_docente like '%${req.query.busqueda}%' or
                    apellidos_docente like '%${req.query.busqueda}%';`
            );

            for (let index = 0; index < selectEstudiantes.rows.length; index++) {
                var lista = [];
                selectEstudiantes.rows[index].observaciones.forEach((s) => { lista.push(s.split(':')) });
                selectEstudiantes.rows[index].observaciones = lista;
            }
            res.send(selectEstudiantes.rows);
        }
    })
    .put(sendNull)
    .delete(sendNull);






module.exports = remisionesRouter;