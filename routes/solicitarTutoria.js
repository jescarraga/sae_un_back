const express = require('express');
const bodyParser = require('body-parser');
const queryCreator = require('../queryUtilities/queryCreator');
const sendNull = require('../queryUtilities/queryNull');


const solicitarTutoria = express.Router();

solicitarTutoria.use(bodyParser.json());

solicitarTutoria.route('/solicitarTutoria')
    .all((req, res, next) => {
        res.statusCode = 200;
        next();
    })
    .post(insertTutoria)
    .get(getTutores)
    .put(sendNull)
    .delete(sendNull);

async function getTutores(req, res, next){
    var request = req.query;
    var listDocentes =  await queryCreator(`select * from public.tutoresdeestudiante('${request.documento_estudiante}');`);
    
    if (!listDocentes.command) {
        return res.send({ status: "Problema al obtener docentes en BD: " + listDocentes});
    } else {
        return res.send(listDocentes.rows);
    }
}

async function insertTutoria(req, res, next) {
    var request = req.body;
    
    var today = await queryCreator(`select current_date`);//Fecha actual del sistema en la BD
    if(!today.rows) return { status: "Problema verificando la fecha del sistema"};

    today = today.rows[0].current_date;
    today = new Date(today);
    appointment = new Date(request.fecha_tutoria); 
    
    if(appointment < today) return res.send({ status: "La fecha ingresada es anterior a la actual: " + appointment});
    
    //La query puede cambiar porque la BD necesita cambios
    var insertTutoria = await queryCreator(`INSERT INTO public.tutorias VALUES(
            '${request.documento_docente}', 
            '${request.documento_estudiante}',  
            '${request.fecha_tutoria}', 
            6
            );
        `);

    if (!insertTutoria.command) {
        return res.send({ status: "Problema al insertar en BD: " + insertTutoria});
    } else {
        return res.send({ status: true });
    }

}


module.exports = solicitarTutoria;