const express = require('express');
const bodyParser = require('body-parser');
const queryCreator = require('../queryUtilities/queryCreator');
const sendNull = require('../queryUtilities/queryNull');


const ingresoEstudianteRouter = express.Router();

ingresoEstudianteRouter.use(bodyParser.json());
var getQuery = `SELECT codigo, nombre_programa_curricular FROM public.programas_curriculares;`;

ingresoEstudianteRouter.route('/ingresoEstudiante')
    .all((req, res, next) => {
        res.statusCode = 200;
        next();
    })
    .post(estudianteR)
    .get(async (req, res, next) => {
        var resultquery = await queryCreator(getQuery);
        res.send(resultquery.rows.map((r) => { return [r.codigo, r.nombre_programa_curricular] }));
    })
    .put(sendNull)
    .delete(sendNull);


    async function estudianteR(req, res, next) {
        var request = req.body;
        var res1 = await queryCreator(getQuery);
        var programas = res1.rows.map((r) => { return r.codigo });
    
        if (request.id_tipo_usuario == 1 && programas.includes(+request.codigo)) {
    
            var insertEstudiante = await queryCreator(
                `CALL public.insertestudiante(
                                '${request.documento}', 
                                '${request.nombres}', 
                                '${request.apellidos}', 
                                '${request.usuario_un}', 
                                ${request.estado == 1 ? true : false}, 
                                ${request.sexo == 1 ? true : false},
                                ${request.codigo},
                                ${request.fecha_ingreso},
                                ${request.cursando},
                                ${request.documento_nacional}, 
                                ${request.id_tipo_usuario});`
            );
    
            if (!insertEstudiante.command) {
                var envio = { status: "No es posible ingresar un estudiante con esos datos: " + insertEstudiante};
                return res.send(envio);
            } else {
                var resp = { status: true };
                return res.send(resp);
            }
    
        } else {
            res.send({ status: "tipo usuario: " + request.id_tipo_usuario + " o codigo plan: " + request.codigo + " -> no validos" });
        }
    }


module.exports = ingresoEstudianteRouter;