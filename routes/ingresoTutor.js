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
        res.send("holi");
    })
    .post((req, res, next) => {
        var request = req.body;


        promEstudiante = queryCreator(
            `SELECT COUNT(1) FROM perfil WHERE documento = '${request.documentoEstudiante}' and id_tipo_usuario = 1 ;`
        ).then((result) => {
            if (result.rows[0].count == 1) {
                return true;
            } else {
                return false;
            }
        })
            .catch(() => { null });

        promDocente = queryCreator(
            `SELECT COUNT(1) FROM perfil WHERE documento = '${request.documentoDocente}' and id_tipo_usuario = 2 ;`

        ).then((result) => {

            if (result.rows[0].count == 1) {
                return true;
            } else {
                return false;
            }
        })
            .catch(() => { null });

        promDuplicado = queryCreator(
            `SELECT COUNT(1) FROM tutores WHERE documento_docente = '${request.documentoDocente}' 
            and documento_estudiante = '${request.documentoEstudiante}';`

        ).then((result) => {

            if (result.rows[0].count == 1) {
                return true;
            } else {
                return false;
            }
        })
        promInsert = queryCreator(
            `INSERT INTO tutores (documento_docente,
            documento_estudiante,
            codigo_plan) VALUES (
            '${request.documentoDocente}',
            '${request.documentoEstudiante}',
            ${request.codigoPlan}
            )`
        ).then((result) => {
            return(result);
        })
            .catch(() => { null });

        Promise.all([promEstudiante, promDocente, promDuplicado]).then(([estudiante, docente, duplicado]) => {
            //console.log(estudiante, docente);
            res.statusCode = 404;
            if (!estudiante && !docente) {
                res.json({
                    "message": "Estudiante y docente inexistentes"
                });
            } else if (!estudiante) {
                res.json({
                    "message": "Estudiante inexistente"
                });
            } else if (!docente) {
                res.json({
                    "message": "Docente inexistente"
                });
            } else if (duplicado) {
                res.statusCode = 400;
                res.json({
                    "message": "El docente ya es tutor del estudiante"
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