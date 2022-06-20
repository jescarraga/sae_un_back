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
        if (Object.keys(req.query).length === 0) { //cuando no hay parámetros
            consultaTotal = queryCreator(
                `SELECT * FROM tutorias t WHERE fecha_de_la_tutoria <= CURRENT_DATE;`
            ).then((result) => {
                return res.json(result.rows);
            })
        } else {
            res.json({ message: "Invalid parameters" })
        }
    })
    .post(sendNull)
    .put(sendNull)
    .delete(sendNull);


module.exports = historialTutorias;
