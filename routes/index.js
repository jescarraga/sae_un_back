const express = require('express');
const bodyParser = require('body-parser');
const database = require('../database');

//const { jsonp } = require('express/lib/response');

const indexRouter = express.Router();

// the system is going to use text fromat
indexRouter.use(bodyParser.text());



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
        next();
    })
    .get((req, res, next) => {
        res.send({"mensaje":"Hola"});
    })
    .post((req, res, next) => {
        var request = JSON.parse(req.body);
        console.log(req.body);

        prom1 = queryCreator(
            `SELECT COUNT(1) FROM password WHERE usuario_un_p like '${request.username}';`
            ).then((result) => {
                
                console.log("1");
                if(result.rows[0].count == 1){
                    return "true";
                }else{
                    return "false";
                }
            })
        .catch(()=> {null});
        
        prom2 = queryCreator(
            `SELECT COUNT(1) FROM password WHERE usuario_un_p like
                '${request.username}'
                and password_usuario like 
                '${request.password}';`
        ).then((result) => {

            console.log("2");
            if(result.rows[0].count == 1){
                return "true";
            }else{
                return "false";
            }
        })
        .catch(()=> {null});
        
        prom3 = queryCreator(
            `SELECT id_tipo_usuario from 
            (SELECT documento FROM usuario where usuario_un like '${request.username}') as resultado
            left join perfil on resultado.documento = perfil.documento;`
        ).then((result) => {
            if(result.rows[0].id_tipo_usuario !== null){
                console.log(req.body);
                return result.rows[0].id_tipo_usuario;
            }else{
                return "0";
            }
        })
        .catch(()=> {null});

        Promise.all([prom1,prom2, prom3]).then(([r1,r2,r3]) => {
            respuesta = {
                "encontro_al_usuario": String(r1),
                "usuario_y_contraseña":String(r2),
                "tipoUsuario":String(r3)
            };
            console.log(respuesta);
            return res.send(respuesta);
        })
    }
    )
    .put(sendNull)
    .delete(sendNull);


module.exports = indexRouter;