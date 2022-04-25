const express = require('express');
const bodyParser = require('body-parser');
const database = require('../database');
const { jsonp } = require('express/lib/response');

const indexRouter = express.Router();

// the system is going to use JSON fromat
indexRouter.use(bodyParser.text());

const obje={
    saludo : "Error"
}

//function that responses with a null value
sendNull = (req, res, next) =>{
    res.send(obje);
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
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get(sendNull)
    .post((req, res, next) => {
        var request = JSON.parse(req.body);
        console.log(req.body);


        prom1 = queryCreator(
            `SELECT COUNT(1) FROM password WHERE usuario_un_p like '${request.username}';`
            ).then((result) => {
                
                if(result.rows[0].count == 1){
                    return "true";
                }else{
                    return "false";
                }
            })
        .catch(()=> {res.send(obje)});
        
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
        .catch(()=> {res.send(obje)});
        
        prom3 = queryCreator(
            `SELECT id_tipo_usuario from 
            (SELECT documento FROM usuario where usuario_un like '${request.username}') as resultado
            left join perfil on resultado.documento = perfil.documento;`
        ).then((result) => {
            if(result.rows[0].id_tipo_usuario ??= null){
                return result.rows[0].id_tipo_usuario;
            }else{
                return "0";
            }
        })
        .catch(()=> {res.send(obje)});

        Promise.all([prom1,prom2, prom3]).then(([r1,r2,r3]) => {
            respuesta = {
                "encontro_al_usuario": String(r1),
                "usuario_y_contraseña":String(r2),
                "tipoUsuario":String(r3)
            };
            res.json(respuesta);
        })
    }
    )
    .put(sendNull)
    .delete(sendNull);


module.exports = indexRouter;