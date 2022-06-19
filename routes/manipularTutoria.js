const express = require('express');
const bodyParser = require('body-parser');
const queryCreator = require('../queryUtilities/queryCreator');
const sendNull = require('../queryUtilities/queryNull');


const manipularTutoria = express.Router();

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
    var listDocentes = await queryCreator(`select * from public.tutoresdeestudiante('${request.documento_estudiante}');`);

    if (!listDocentes.command) {
        return res.send({ status: "Problema al obtener docentes en BD: " + listDocentes });
    } else {
        return res.send(listDocentes.rows);
    }
}

async function insertTutoria(req, res, next) {
    var request = req.body;


    var today = await queryCreator(`select current_date`);//Fecha actual del sistema en la BD
    if (!today.rows) return { status: "Problema verificando la fecha del sistema" };

    today = today.rows[0].current_date;
    today = new Date(today);
    appointment = new Date(request.fecha_tutoria);

    if (appointment < today) return res.send({ status: "La fecha ingresada es anterior a la actual: " + appointment });
    if (request.tipo_usuario == "estudiante")request.id_estado_tutoria = 6;
    if (request.tipo_usuario == "docente") request.id_estado_tutoria = 1;

    var actual_state = await queryCreator(`
    select * from tutorias 
    where documento_docente = '${request.documento_docente}'
    and documento_estudiante = '${request.documento_estudiante}'
    end fecha_de_la_tutoria = '${request.fecha_tutoria}'
    `);
    

    //La query puede cambiar porque la BD necesita cambios
    var insertTutoria = await queryCreator(`CALL public.insert_tutoria(
            '${request.documento_docente}', 
            '${request.documento_estudiante}',  
            '${request.fecha_tutoria}', 
            '${request.id_estado_tutoria}'
            );
        `);

    if (!insertTutoria.command) {
        return res.send({ status: "Problema al insertar en BD: " + insertTutoria });
    } else {
        return res.send({ status: true });
    }

}


module.exports = manipularTutoria;