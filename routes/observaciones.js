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
    res.send({ status: "Estamos trabajando para tener esta chingadera funcionando"});
    
}


module.exports = observacionesRouter;