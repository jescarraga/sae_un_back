const express = require('express');
const bodyParser = require('body-parser');
const queryCreator = require('../queryUtilities/queryCreator');
const sendNull = require('../queryUtilities/queryNull');

const observacionesRouter = express.Router();
observacionesRouter.use(bodyParser.json());

observacionesRouter.route('/observaciones')
    .all((req, res, next) => {
        res.statusCode = 200;
        next();
    })
    .post(docenteR)
    .get(async (req, res, next) => {
        var selectEstudiantes = await queryCreator(
            `select * from public.observaciones_y_estudiantes_docente('${req.query.documento}');`
        );
        var lista = [];
        selectEstudiantes.rows[0].observaciones.forEach((s) => { lista.push(s.split(':')) });
        selectEstudiantes.rows[0].observaciones = lista;
        res.send(selectEstudiantes.rows[0]);
    })
    .put(sendNull)
    .delete(sendNull);



async function docenteR(req, res, next) {
    var request = req.body;
    var res1 = await queryCreator(`select codigo_plan FROM public.tutores where documento_estudiante = '${request.documento_estudiante}' and documento_docente = '${request.documento_docente}';`);
    var codigos_estudiante = res1.rows.map((r) => { return r.codigo_plan });

    if (codigos_estudiante.includes(+request.codigo_plan)) {
        var insertobservacion = await queryCreator(
            `CALL public.insertobservacion(
                '${request.documento_docente}',
                '${request.documento_estudiante}',
                ${request.codigo_plan},
                '${request.observacion}');`
        );

        if (!insertobservacion.command) {
            var envio = { status: "No es posible ingresar una observacion con esos datos: " + insertobservacion };
            return res.send(envio);
        } else {
            var resp = { status: true };
            return res.send(resp);
        }
    }
    else {
        res.send({ status: "ese estudiante no tiene ese plan asociado con ese docente" });
    }

}


observacionesRouter.route('/observaciones/all')
    .all((req, res, next) => {
        res.statusCode = 200;
        next();
    })
    .post(sendNull)
    .get(async (req, res, next) => {
        var selectEstudiantes = await queryCreator(
            `select distinct
            public.usuario.documento,
            public.usuario.nombres,
            public.usuario.apellidos,
            public.tutores.documento_docente,
            (select nombres from public.usuario where documento = public.tutores.documento_docente),
            (select apellidos from public.usuario where documento = public.tutores.documento_docente),
            public.tutores.codigo_plan,
            public.programas_curriculares.nombre_programa_curricular,
            array(select concat(codigo_observacion,':', observacion) from public.observaciones where public.observaciones.documento_estudiante = public.usuario.documento and public.observaciones.documento_docente = public.tutores.documento_docente) as observaciones
        from
            public.tutores
        inner join public.usuario on documento = public.tutores.documento_estudiante
        inner join public.programas_curriculares on codigo = public.tutores.codigo_plan
        inner join public.observaciones on documento = observaciones.documento_estudiante;`
        );


        for (let index = 0; index < selectEstudiantes.rows.length; index++) {
            var lista = [];
            selectEstudiantes.rows[index].observaciones.forEach((s) => { lista.push(s.split(':'))});
            selectEstudiantes.rows[index].observaciones = lista;
        }


        res.send(selectEstudiantes.rows);
    })
    .put(sendNull)
    .delete(sendNull);






module.exports = observacionesRouter;