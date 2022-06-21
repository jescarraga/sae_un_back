const express = require('express');
const bodyParser = require('body-parser');
const queryCreator = require('../queryUtilities/queryCreator');
const sendNull = require('../queryUtilities/queryNull');

//const { jsonp } = require('express/lib/response');

const remisionesBienestar = express.Router();

// the system is going to use text fromat
remisionesBienestar.use(bodyParser.json());

remisionesBienestar.route('/bienestar/remisiones')
    .all((req, res, next) => {
        res.statusCode = 200;
        next();
    })
    .get((req, res, next) => {
        docente = req.query.documentoDocente;
        estudiante = req.query.documentoEstudiante;
        if (Object.keys(req.query).length === 0) { //cuando no hay parámetros
            consultaTotal = queryCreator(
                //Query para seleccionar todos los estudiantes activos con tutores asignados
                `select public.remisiones.codigo_remision,
                (select concat(public.usuario.nombres,' ',public.usuario.apellidos) as nombre_completo
                from usuario where documento = documento_docente) as nombre_apellido_docente,
                documento_docente,
                (select concat(public.usuario.nombres,' ',public.usuario.apellidos) as nombre_completo
                from usuario where documento = documento_estudiante) as nombre_apellido_estudiante,
                documento_estudiante,
                (select public.programas_curriculares.nombre_programa_curricular  as nombre_plan_1
                from programas_curriculares where public.programas_curriculares.codigo = public.remisiones.codigo_plan) as nombre_plan,
                (select public.tipo_remisiones.nombre_remision as nombre_remision_1
                from tipo_remisiones where public.tipo_remisiones.codigo_tipo_remision = public.remisiones.codigo_tipo_remision) as tipo_remision,
                public.remisiones.fecha,
                public.remisiones.atendida
                from public.remisiones;`


            ).then((result) => {
                
                return (result.rows);

            })
            consultaTotal.then((rows) => {
                
                res.json(rows);
            })
        } else if (!docente) { //Si se envía solo el estudiante
            consultaEstudiante = queryCreator(
            
                `SELECT r.documento_docente , r.documento_estudiante , r.codigo_plan, r.motivo_remision, r.fecha, r.codigo_remision, r.atendida, r.codigo_tipo_remision , u.nombres as nombres_docente , u.apellidos as apellidos_docente , u.usuario_un as usuario_docente
                FROM remisiones r INNER JOIN usuario u on r.documento_docente =u.documento
                WHERE documento_estudiante = '${estudiante}' `
            ).then((result) => {
                console.log(result)
                return (result.rows);

            })
            consultaEstudiante.then((rows) => {
                res.json(rows);
            })
        } else if (!estudiante) {//Si se envía solo el docente
            consultaDocente = queryCreator(
                
                `SELECT r.documento_docente , r.documento_estudiante , r.codigo_plan, r.motivo_remision, r.fecha, r.codigo_remision, r.atendida, r.codigo_tipo_remision , u.nombres as nombres_estudiante , u.apellidos as apellidos_estudiante , u.usuario_un as usuario_estudiante
                FROM remisiones r INNER JOIN usuario u on r.documento_estudiante =u.documento
                WHERE documento_docente = '${docente}' ;`

            ).then((result) => {

                return (result.rows);

            })
            consultaDocente.then((rows) => {

                res.json(rows);
            })
        } else if (estudiante && docente) {//si se envían ambas
            consultaAmbas = queryCreator(
                //query para obtener asignaciones de un tutor con un estudiante
                `SELECT * FROM remisiones WHERE documento_docente = '${docente}' AND documento_estudiante = '${estudiante}';`

            ).then((result) => {

                return (result.rows);

            })
            consultaAmbas.then((rows) => {
                res.json(rows);
            })
        } else {
            res.json({ message: "Invalid parameters" })
        }
    })
    .post((req, res, next) => {
        var request = req.body;
        //para cambiar en BD 
        promUpdate = queryCreator(
            `UPDATE remisiones SET atendida = ${request.atendida} WHERE codigo_remision = ${request.codigo_remision}`
        ).then((result) => {
            
            return (result);
        })
        .catch(() => { null });

        promUpdate.then((result)=>{
            //console.log(result)
            res.json({affected_rows: result.rowCount})
        })
    })

    .put(sendNull)
    .delete(sendNull);


module.exports = remisionesBienestar;