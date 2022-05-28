const express = require('express');
const bodyParser = require('body-parser');
const queryCreator = require('../queryUtilities/queryCreator');
const sendNull = require('../queryUtilities/queryNull');

const observacionesRouter = express.Router();
observacionesRouter.use(bodyParser.json());

observacionesRouter.route('/observaciones')
    .all((req, res, next) => {
        res.statusCode = 200;
        next();
    })
    .post(docenteR)
    .get(async (req, res, next) => {
        var selectEstudiante = await queryCreator(
            `select * from public.select_estudiantes_de_docente('${req.query.documento}');`
        );

        res.send(selectEstudiante.rows.map((r) => { return [r.nombres, r.apellidos, r.documento_estudiante, r.observacion] }));
    })
    .put(sendNull)
    .delete(sendNull);



async function docenteR(req, res, next) {
    var request = req.body;
    var res1 = await queryCreator(`SELECT codigo FROM public.programas_curriculares;`);
    var codigo_planes = res1.rows.map((r) => { return r.id_departamento });

    if (codigo_planes.includes(+request.codigo_plan)) {

        var insertobservacion = await queryCreator(
            `CALL public.insertobservacion(
                '${request.documento_docente}',
                '${request.documento_estudiante}',
                '${request.codigo_plan},
                ${request.observacion}');`
        );

        if (!insertobservacion.command) {
            var envio = { status: "No es posible ingresar una observacion con esos datos: " + insertobservacion };
            return res.send(envio);
        } else {
            var resp = { status: true };
            return res.send(resp);
        }

    } else {
        res.send({ status: "codigo plan no existe: " +  request.codigo_plan});
    }
}


module.exports = observacionesRouter;