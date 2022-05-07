const express = require('express');
const bodyParser = require('body-parser');
const queryCreator = require('../queryUtilities/queryCreator');
const sendNull = require('../queryUtilities/queryNull');


//const { jsonp } = require('express/lib/response');
const indexRouter = express.Router();

// the system is going to use text fromat
indexRouter.use(bodyParser.json());


indexRouter.route('/auth')
    .all((req, res, next) => {
        res.statusCode = 200;
        next();
    })
    .get((req, res, next) => {
        res.send({"mensaje":"Hola"});
    })
    .post((req, res, next) => {
        var request = req.body;


        prom1 = queryCreator(
            `SELECT COUNT(1) FROM password WHERE usuario_un_p like '${request.username}';`
            ).then((result) => {
                
                if(result.rows[0].count == 1){
                    return true;
                }else{
                    return false;
                }
            })
        .catch(()=> {null});
        
        prom2 = queryCreator(
            `SELECT COUNT(1) FROM password WHERE usuario_un_p like
                '${request.username}'
                and password_usuario like 
                '${request.password}';`
        ).then((result) => {

            if(result.rows[0].count == 1){
                return true;
            }else{
                return false;
            }
        })
        .catch(()=> {null});
        
        prom3 = queryCreator(
            `SELECT id_tipo_usuario from 
            (SELECT documento FROM usuario where usuario_un like '${request.username}') as resultado
            left join perfil on resultado.documento = perfil.documento;`
        ).then((result) => {
            if(result.rowCount > 0){
                return result.rows[0].id_tipo_usuario;
            }else{
                return 0;
            }
        })
        .catch(()=> {null});

        Promise.all([prom1,prom2, prom3]).then(([r1,r2,r3]) => {
            
            respuesta = {
                "encontro_al_usuario": r1,
                "usuario_y_contraseña":r2,
                "tipoUsuario":r3,
                "usuario_registrado":request.username,
                "status":false
            };

            if(r1 == true && r2 == true) {
                respuesta.status = true
            }
            
            return res.send(respuesta);
        })
    }
    )
    .put(sendNull)
    .delete(sendNull);


module.exports = indexRouter;