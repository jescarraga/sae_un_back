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
    var departaments = res1.rows.map((r) => { return r.id_departamento });

    if (departaments.includes(+request.id_departamento)) {

        var insertUsuario = await queryCreator(
            `CALL public.insertobservacion(':documento_docente',':documento_estudiante',':codigo_plan,:observacion');`
        );

        if (!insertUsuario.command) {
            var envio = { status: "No es posible ingresar un usuario con esos datos: " + insertUsuario };
            return res.send(envio);
        } else {
            var resp = { status: true };
            return res.send(resp);
        }

    } else {
        res.send({ status: "tipo usuario: " + request.id_tipo_usuario + " o departamento: " + request.id_departamento + " -> no validos" });
    }
}


module.exports = observacionesRouter;