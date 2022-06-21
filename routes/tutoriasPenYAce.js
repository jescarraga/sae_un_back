const express = require("express");
const bodyParser = require("body-parser");
const queryCreator = require("../queryUtilities/queryCreator");
const sendNull = require("../queryUtilities/queryNull");

const tutoriasPenYAceRouter = express.Router();
tutoriasPenYAceRouter.use(bodyParser.json());

tutoriasPenYAceRouter.route('/tutoriasPenYAce')
  .all((req, res, next) => {
    res.statusCode = 200;
    next();
  })
  .post(tutoria_realizada)
  .get(tutorias_pendientes)
  .put(sendNull)
  .delete(sendNull);

async function tutorias_pendientes(req, res, next) {
  var request = req.query;

  if (request.id_tipo_usuario == '1' || request.id_tipo_usuario == '2') {
    var obtener_tutorias_pendientes = await queryCreator(
      `SELECT * from public.ver_tutorias_pendientes(
                    ${request.id_tipo_usuario},
                    '${request.documento}');`
    );

    return res.send(obtener_tutorias_pendientes);
  }if(!obtener_tutorias_pendientes){
    return res.send({status : 'error'});
  }else{
    return res.send({status : 'ok'});
  }
}

async function tutoria_realizada(req, res, next) {
  var request = req.body;

  if (request.id_tipo_usuario == '2') {
    var obtener_tutorias_pendientes = await queryCreator(
      `UPDATE public.tutorias
      SET estado_tutoria = 4
      WHERE documento_docente='${request.documento_docente}' AND documento_estudiante='${request.documento_estudiante}' AND fecha_de_la_tutoria='${request.fecha_de_la_tutoria}';
       `
    );
    if(!obtener_tutorias_pendientes){
      return res.send({status : 'error'});
    }else{
      return res.send({status : 'ok'});
    }
}
}

module.exports = tutoriasPenYAceRouter;
