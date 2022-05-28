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
        var selectEstudiantes = await queryCreator(
            `select * from public.select_estudiantes_de_docente('${req.query.documento}');`
        );

        res.send(selectEstudiantes.rows.map((r) => { return [r.nombres, r.apellidos, r.documento_estudiante, r.codigo_plan, r.nombre_programa_curricular] }));
    })
    .put(sendNull)
    .delete(sendNull);



async function docenteR(req, res, next) {
    var request = req.body;
    var res1 = await queryCreator(`select codigo_plan FROM public.tutores where documento_estudiante = '${request.documento_estudiante}' and documento_docente = '${request.documento_docente}';`);
    var codigos_estudiante = res1.rows.map((r) => { return r.codigo_plan });

    if (codigos_estudiante.includes(+request.codigo_plan)) {
        var insertobservacion = await queryCreator(
            `CALL public.insertobservacion(
                '${request.documento_docente}',
                '${request.documento_estudiante}',
                ${request.codigo_plan},
                '${request.observacion}');`
        );

        if (!insertobservacion.command) {
            var envio = { status: "No es posible ingresar una observacion con esos datos: " + insertobservacion };
            return res.send(envio);
        } else {
            var resp = { status: true };
            return res.send(resp);
        }
    }
    else {
        res.send({ status: "ese estudiante no tiene ese plan asociado con ese docente "});
    }

}








module.exports = observacionesRouter;