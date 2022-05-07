const database = require('../database');

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


module.exports = queryCreator;