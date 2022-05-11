const express = require('express');
const bodyParser = require('body-parser');
const database = require('../database');

//const { jsonp } = require('express/lib/response');

const ingresoTutorRouter = express.Router();

// the system is going to use text fromat
ingresoTutorRouter.use(bodyParser.json());


/*
    Allows the creation of querys and responses with promise to handle it
*/
function queryCreator(theQuery) {
    return (
        new Promise((resolve, reject) => {
            database.query(theQuery, (err, res1) => {
                if (err) resolve(err);
                else resolve(res1);
            });
        })
    );
}

/*
    Prototype of function that responses with a NULL value
*/
sendNull = (req, res, next) => {
    res.send(null);
}


ingresoTutorRouter.use(bodyParser.json());

ingresoTutorRouter.route('/ingresoTutor')
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
                `SELECT * FROM tutores WHERE documento_estudiante in (select documento from estado_semestre where cursando = true);`

            ).then((result) => {

                return (result.rows);

            })
            consultaTotal.then((rows) => {
                res.json(rows);
            })
        } else if (!docente) { //Si se envía solo el estudiante
            consultaEstudiante = queryCreator(
                //Query para obtener docentes tutores asignados a un estudiante
                `select t.documento_docente , t.documento_estudiante , t.codigo_plan , u.nombres , u.apellidos , u.usuario_un
                from tutores t inner join usuario u on t.documento_docente =u.documento
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
                //Query para obtener estudiantes asignados a un docente
                `select t.documento_docente , t.documento_estudiante , t.codigo_plan , u.nombres , u.apellidos , u.usuario_un
                from tutores t inner join usuario u on t.documento_estudiante =u.documento
                WHERE documento_estudiante in (select documento from estado_semestre where cursando = true) AND documento_docente = '${docente}' ;`

            ).then((result) => {

                return (result.rows);

            })
            consultaDocente.then((rows) => {

                res.json(rows);
            })
        } else if (estudiante && docente) {//si se envían ambas
            consultaAmbas = queryCreator(
                //query para obtener asignaciones de un tutor con un estudiante
                `SELECT * FROM tutores WHERE documento_docente = '${docente}' AND documento_estudiante = '${estudiante}' and documento_estudiante in (select documento from estado_semestre where  cursando = true);`

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


        promEstudiante = queryCreator(
            //se verifica si existe el estudiante y está activo
            `select count(1) from estado_semestre where documento =  '${request.documentoEstudiante}'  and documento in (select documento from estado_semestre where documento = '${request.documentoEstudiante}' and cursando = true);`
        ).then((result) => {
            if (result.rows[0].count != 0) {
                return true;
            } else {
                return false;
            }
        })
            .catch(() => { null });

        promDocente = queryCreator(
            //verificar existencia de docente
            `SELECT COUNT(1) FROM docente WHERE documento = '${request.documentoDocente}' ;`

        ).then((result) => {

            if (result.rows[0].count == 1) {
                return true;
            } else {
                return false;
            }
        })
            .catch(() => { null });


        promPlan = queryCreator(
            //verificar existencia de plan
            `SELECT COUNT(1) FROM programas_curriculares WHERE codigo = '${request.codigoPlan}' ;`

        ).then((result) => {

            if (result.rows[0].count == 1) {
                return true;
            } else {
                return false;
            }
        })
            .catch(() => { null });

        promDuplicado = queryCreator(
            //verificar si hay duplicados estudiante-plan
            `SELECT COUNT(1) FROM tutores WHERE codigo_plan = '${request.codigoPlan}' 
            and documento_estudiante = '${request.documentoEstudiante}';`

        ).then((result) => {

            if (result.rows[0].count != 0) {
                return true;
            } else {
                return false;
            }
        })

        //para insertar en BD 
        promInsert = queryCreator(
            `CALL inserttutor(
            '${request.documentoEstudiante}',
            '${request.documentoDocente}',
            ${request.codigoPlan}
            )`
        ).then((result) => {
            return (result);
        })
            .catch(() => { null });

        Promise.all([promEstudiante, promDocente, promPlan, promDuplicado]).then(([estudiante, docente, plan, duplicado]) => {
            res.statusCode = 404;
            if (!estudiante && !docente) {
                res.json({
                    "message": "Estudiante y docente inexistentes"
                });
            } else if (!estudiante) {
                res.json({
                    "message": "Estudiante inexistente o inactivo"
                });
            } else if (!docente) {
                res.json({
                    "message": "Docente inexistente"
                });
            } else if (!plan) {
                res.json({
                    "message": "Código de programa inexistente"
                });
            } else if (duplicado) {
                res.statusCode = 400;
                res.json({
                    "message": "El estudiante ya tiene un tutor asignado para el programa especificado"
                });
            } else {

                promInsert.then((inserted) => {
                    res.statusCode = 200;
                    res.send(request);
                    console.log(inserted)
                })
            }
        })

    }
    )

    .put(sendNull)
    .delete(sendNull);


module.exports = ingresoTutorRouter;