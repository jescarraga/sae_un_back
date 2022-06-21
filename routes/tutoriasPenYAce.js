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
  .post(sendNull)
  .get(tutorias_pendientes)
  .put(sendNull)
  .delete(sendNull);

async function tutorias_pendientes(req, res, next) {
  var request = req.query;

  if (request.id_tipo_usuario == '1' || request.id_tipo_usuario == '2') {
    var obtener_tutorias_pendientes = await queryCreator(
      `SELECT public.ver_tutorias_pendientes(
                    ${request.id_tipo_usuario},
                    '${request.documento}');`
    );

    listaTutoriasPendientes = [];

    for (let index = 0; index <obtener_tutorias_pendientes.rows.length; index++) {
      
      var longitudCadena = obtener_tutorias_pendientes.rows[index].ver_tutorias_pendientes.length;
      var tutoria_vector = obtener_tutorias_pendientes.rows[index].ver_tutorias_pendientes.substring(1,longitudCadena-1).split(',');
      var tutoria = {
        documento :tutoria_vector[0],
        nombre: tutoria_vector[1].substring(1,tutoria_vector[1].length-1),
        fecha_de_la_tutoria:  tutoria_vector[2]
      };
      
      listaTutoriasPendientes[index]= tutoria;
      
    }

    return res.send(listaTutoriasPendientes);
}
}

module.exports = tutoriasPenYAceRouter;
