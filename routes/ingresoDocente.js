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
            `INSERT INTO public.usuario(documento, nombres, apellidos, usuario_un, estado, sexo) 
                        VALUES (
                            '${request.documento}', 
                            '${request.nombres}', 
                            '${request.apellidos}', 
                            '${request.usuario_un}', 
                            '${request.estado}', 
                            '${request.sexo}');`
        );

        if (!insertUsuario.command) {
            var envio = { status: "No es posible ingresar un usuario con esos datos: " + insertUsuario.detail };
            return res.send(envio);
        }

        insertDocentes = await queryCreator(
            `INSERT INTO public.docente(documento, id_departamento) values('${request.documento}','${request.id_departamento}');`
        );

        insertPerfil = await queryCreator(
            `INSERT INTO public.perfil(id_tipo_usuario, documento) values('${request.id_tipo_usuario}','${request.documento}')`
        );

        if (insertDocentes.command && insertPerfil.command && insertUsuario.command) {
            return res.send({ status: true });
        } else {
            var resp = { status: insertDocentes.detail + "\n" + insertPerfil.detail + "\n" + insertUsuario.detail };
            return res.send(resp);
        }

    } else {
        res.send({ status: "tipo usuario: " + request.id_tipo_usuario + " o departamento: " + request.id_departamento + " -> no validos" });
    }
}



module.exports = docenteRouter;