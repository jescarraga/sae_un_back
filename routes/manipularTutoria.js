const express = require('express');
const bodyParser = require('body-parser');
const queryCreator = require('../queryUtilities/queryCreator');
const sendNull = require('../queryUtilities/queryNull');






const manipularTutoria = express.Router();
const estados_tutorias = ["","Aceptada","Rechazada","Cancelada","Realizada","No realizada","Pendiente"];

manipularTutoria.use(bodyParser.json());

manipularTutoria.route('/manipularTutoria')
    .all((req, res, next) => {
        res.statusCode = 200;
        next();
    })
    .post(insertTutoria)
    .get(getTutores)
    .put(sendNull)
    .delete(sendNull);

async function getTutores(req, res, next) {
    var request = req.query;
    var listDocentes = {};

    if (request.documento_estudiante) {
        var listDocentes = await queryCreator(`select * from public.tutoresdeestudiante('${request.documento_estudiante}');`);
    }

    if (!listDocentes.command) {
        return res.send({ status: "Problema al obtener docentes en BD: " + listDocentes });
    } else {
        return res.send(listDocentes.rows[0]);
    }
}

async function insertTutoria(req, res, next) {
    var request = req.body;
    var today = await queryCreator(`select current_date`);//Fecha actual del sistema en la BD
    if (!today.rows[0]) return { status: "Problema verificando la fecha del sistema" };

    today = today.rows[0].current_date;
    today = new Date(today);
    appointment = new Date(request.fecha_tutoria);
    if (appointment < today) return res.send({ status: "La fecha ingresada es anterior a la actual: " + appointment });

    var actual_state = await queryCreator(`
        select * from tutorias 
            where documento_docente = '${request.documento_docente}'
            and documento_estudiante = '${request.documento_estudiante}'
            and fecha_de_la_tutoria = '${request.fecha_tutoria}'
    `);

    if (!actual_state.rows) return res.send({ status: "Error in BD: " + actual_state });
    if (request.tipo_usuario == "estudiante" && actual_state.rows.length < 1) request.id_estado_tutoria = 6;
    if (request.tipo_usuario == "estudiante" && actual_state.rows.length > 0) return res.send({ status: "Este estudiante ya tiene una tutoría en esta fecha con ese docente" });
    if (request.tipo_usuario == "docente" && actual_state.rows.length < 1) request.id_estado_tutoria = 1;

    var status_in_bd = actual_state.rows[0].estado_tutoria;
    if (request.tipo_usuario == "docente" && actual_state.rows.length > 0) {
        if ((status_in_bd > 1 && status_in_bd < 6)
            || (request.id_estado_tutoria == 6)
            || (request.id_estado_tutoria == 3 && status_in_bd != 1)
            || ((request.id_estado_tutoria == 1 || request.id_estado_tutoria == 2) && status_in_bd != 6)
            || ((request.id_estado_tutoria == 4 || request.id_estado_tutoria == 5) && status_in_bd != 1)
        ) {
            return res.send({ status: "No se puede cambiar el estado de la tutoria: " + estados_tutorias[status_in_bd] + " al estado: " + estados_tutorias[request.id_estado_tutoria] });
        }
    }

    var insertTutoria = await queryCreator(`CALL public.insert_tutoria(
            '${request.documento_docente}', 
            '${request.documento_estudiante}',  
            '${request.fecha_tutoria}', 
            ${request.id_estado_tutoria}
            );
        `);

    if (!insertTutoria.command) {
        return res.send({ status: "Problema al insertar en BD: " + insertTutoria });
    } else {
        return res.send({ status: true });
    }

}


module.exports = manipularTutoria;