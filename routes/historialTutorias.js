const express = require('express');
const bodyParser = require('body-parser');
const queryCreator = require('../queryUtilities/queryCreator');
const sendNull = require('../queryUtilities/queryNull');

//const { jsonp } = require('express/lib/response');

const historialTutorias = express.Router();

// the system is going to use text format
historialTutorias.use(bodyParser.json());

historialTutorias.route('/docente/tutorias/historial')
    .all((req, res, next) => {
        res.statusCode = 200;
        next();
    })
    .get((req, res, next) => {
        estudiante = req.query.documentoEstudiante;
        docente = req.query.documentoDocente;
        if (docente) {
            if (estudiante) {
                consultaDocente = queryCreator(
                    `SELECT t.documento_docente, t.documento_estudiante, t.fecha_de_la_tutoria,
                                t.estado_tutoria, u.nombres as nombre_estudiante, u.apellidos as apellido_estudiante 
                                FROM tutorias t inner join usuario u on t.documento_estudiante = u.documento  WHERE 
                                documento_docente = '${docente}' AND documento_estudiante = '${estudiante}'
                                 AND fecha_de_la_tutoria < CURRENT_DATE ;`
                ).then((result) => {
                    return res.json(result.rows);
                })
            } else {
                consultaDocente = queryCreator(
                    `SELECT t.documento_docente, t.documento_estudiante, t.fecha_de_la_tutoria,
                                t.estado_tutoria, u.nombres as nombre_estudiante, u.apellidos as apellido_estudiante 
                                FROM tutorias t inner join usuario u on t.documento_estudiante = u.documento  WHERE 
                                documento_docente = '${docente}' AND fecha_de_la_tutoria < CURRENT_DATE ;`
                ).then((result) => {
                    return res.json(result.rows);
                })
            }

        } else {
            res.json({message: "Invalid parameters"})
        }
    })
    .post(sendNull)
    .put(sendNull)
    .delete(sendNull);

historialTutorias.route('/estudiante/tutorias/historial')
    .all((req, res, next) => {
        res.statusCode = 200;
        next();
    })
    .get((req, res, next) => {
        estudiante = req.query.documentoEstudiante;
        if (estudiante) {
            consultaEstudiante = queryCreator(
                `SELECT t.documento_docente, t.documento_estudiante, t.fecha_de_la_tutoria,
                                t.estado_tutoria, u.nombres as nombre_docente, u.apellidos as apellido_docente 
                                FROM tutorias t inner join usuario u on t.documento_docente = u.documento  WHERE
                                documento_estudiante = '${estudiante}'
                                 AND fecha_de_la_tutoria < CURRENT_DATE ;`
            ).then((result) => {
                return res.json(result.rows);
            })
        } else {
            res.json({message: "Invalid parameters"})
        }
    })
    .post(sendNull)
    .put(sendNull)
    .delete(sendNull);

module.exports = historialTutorias;
