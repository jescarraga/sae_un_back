const express = require("express");
const bodyParser = require("body-parser");
const queryCreator = require("../queryUtilities/queryCreator");
const sendNull = require("../queryUtilities/queryNull");

const observacionesRouter = express.Router();
observacionesRouter.use(bodyParser.json());

function formatObservaciones(listEstudents) {
  if (listEstudents) {
    for (let index = 0; index < listEstudents.length; index++) {
      var lista = [];
      listEstudents[index].observaciones.forEach((s) => { lista.push(s.split(':')) });
      listEstudents[index].observaciones = lista;
    }
  }
  return listEstudents;
}

observacionesRouter.route('/observaciones')
  .all((req, res, next) => {
    res.statusCode = 200;
    next();
  })
  .post(postObservaciones)
  .get(async (req, res, next) => {
    var selectEstudiantes = await queryCreator(`select nombres, apellidos, documento as documento_estudiante, codigo_plan, nombre_programa_curricular, observaciones from public.all_observaciones where documento_docente =  '${req.query.documento}';`);
    var dataList = formatObservaciones(selectEstudiantes.rows);
    res.send(dataList);
  })
  .put(sendNull)
  .delete(sendNull);


async function postObservaciones(req, res, next) {
  var request = req.body;
  var res1 = await queryCreator(
    `select codigo_plan FROM public.tutores where documento_estudiante = '${request.documento_estudiante}' and documento_docente = '${request.documento_docente}';`
  );
  var codigos_estudiante = res1.rows.map((r) => {
    return r.codigo_plan;
  });

  if (codigos_estudiante.includes(+request.codigo_plan)) {
    var insertobservacion = await queryCreator(
      `CALL public.insertobservacion(
                '${request.documento_docente}',
                '${request.documento_estudiante}',
                ${request.codigo_plan},
                '${request.observacion}');`
    );

    if (!insertobservacion.command) {
      var envio = {
        status:
          "No es posible ingresar una observacion con esos datos: " +
          insertobservacion,
      };
      return res.send(envio);

    } else {
      var resp = { status: true };
      return res.send(resp);
    }

  } else {
    res.send({
      status: "ese estudiante no tiene ese plan asociado con ese docente",
    });

  }
}

observacionesRouter
  .route("/observaciones/all")
  .all((req, res, next) => {
    res.statusCode = 200;
    next();
  })
  .post(sendNull)
  .get(async (req, res, next) => {

    if (!req.query.busqueda) {

      var selectEstudiantes = await queryCreator(
        `SELECT * FROM public.all_observaciones;`
      );
      var dataList = formatObservaciones(selectEstudiantes.rows);
      res.send(dataList);

    } else {

      var selectEstudiantes = await queryCreator(
        `select * from public.all_observaciones where 
        documento_docente like '%${req.query.busqueda}%' or 
        documento like '%${req.query.busqueda}%' or
        nombres like '%${req.query.busqueda}%' or 
        apellidos like '%${req.query.busqueda}%' or
        nombre_docente like '%${req.query.busqueda}%' or
        apellido_docente like '%${req.query.busqueda}%';`
      );

      var dataList = formatObservaciones(selectEstudiantes.rows);
      res.send(dataList);
    }
  })
  .put(sendNull)
  .delete(sendNull);

module.exports = observacionesRouter;
