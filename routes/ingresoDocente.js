const express = require('express');
const bodyParser = require('body-parser');
const queryCreator = require('../queryUtilities/queryCreator');
const sendNull = require('../queryUtilities/queryNull');

const docenteRouter = express.Router();

docenteRouter.use(bodyParser.json());
var getQuery = `SELECT id_departamento, nombre_departamento FROM public.departamento;`;

docenteRouter.route('/ingresoDocente')
    .all((req, res, next) => {
        res.statusCode = 200;
        next();
    })
    .post(docenteR)
    .get(async (req, res, next) => {
        var resultquery = await queryCreator(getQuery);
        res.send(resultquery.rows.map((r) => { return [r.id_departamento, r.nombre_departamento] }));
    })
    .put(sendNull)
    .delete(sendNull);


async function docenteR(req, res, next) {
    var request = req.body;
    var res1 = await queryCreator(getQuery);
    var departaments = res1.rows.map((r) => { return r.id_departamento });

    if (request.id_tipo_usuario == 2 && departaments.includes(+request.id_departamento)) {

        var insertUsuario = await queryCreator(
            `CALL public.insertdocente(
                            '${request.documento}', 
                            '${request.nombres}', 
                            '${request.apellidos}', 
                            '${request.usuario_un}', 
                            ${request.estado ? true : false}, 
                            ${request.sexo ? true : false},
                            ${request.id_departamento}, 
                            ${request.id_tipo_usuario});`
        );

        if (!insertUsuario.command) {
            var envio = { status: "No es posible ingresar un usuario con esos datos: " + insertUsuario};
            return res.send(envio);
        } else {
            var resp = { status: true };
            return res.send(resp);
        }

    } else {
        res.send({ status: "tipo usuario: " + request.id_tipo_usuario + " o departamento: " + request.id_departamento + " -> no validos" });
    }
}


module.exports = docenteRouter;