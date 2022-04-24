const express = require('express');
const bodyParser = require('body-parser');
const database = require('../database');

const indexRouter = express.Router();

// the system is going to use JSON fromat
indexRouter.use(bodyParser.json());

//function that responses with a null value
sendNull = (req, res, next) =>{
    res.send(null);
}

//query maker and handler
function queryCreator(theQuery){
    return(
        new Promise((resolve, reject) =>{
            database.query(theQuery,(err, res1)=>{
                if (err) resolve(err);
                else resolve(res1);
            })
        })
    )
}

indexRouter.route('/auth')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.set({
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            //"Access-Control-Allow-Credentials" : true 
        });
        next();
    })
    .get(sendNull)
    .post((req, res, next) => {
        var request = req.body;

        prom1 = queryCreator(
            `SELECT COUNT(1) FROM password WHERE usuario_un_p like '${request.username}';`
            ).then((result) => {
                if(result.rows[0].count == 1){
                    return "true";
                }else{
                    return "false";
                }
            })
        .catch(()=> {return null});
        
        prom2 = queryCreator(
            `SELECT COUNT(1) FROM password WHERE usuario_un_p like
                '${request.username}'
                and password_usuario like 
                '${request.password}';`
        ).then((result) => {
            if(result.rows[0].count == 1){
                return "true";
            }else{
                return "false";
            }
        })
        .catch(()=> {return null});
        
        prom3 = queryCreator(
            `SELECT id_tipo_usuario from 
            (SELECT documento FROM usuario where usuario_un like '${request.username}') as resultado
            left join perfil on resultado.documento = perfil.documento;`
        ).then((result) => {
            return result.rows[0].id_tipo_usuario;
        })
        .catch(()=> {return null});

        Promise.all([prom1,prom2]).then(([r1,r2]) => {
            respuesta = {};
            respuesta.encontro_al_usuario = r1;
            respuesta.usuario_y_contraseña = r2;
            
            if(r1 == "true" && r2 == "true"){
                prom3.then((r3) => {
                    respuesta.tipoUsuario = r3;
                    res.send(respuesta);
                });
            }else{
                res.send(respuesta);
            }
        })
    }
    )
    .put(sendNull)
    .delete(sendNull);


module.exports = indexRouter;