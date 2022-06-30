//function that responses with a null value
sendNull = (req, res, next) =>{
    res.send(null);
}

module.exports = sendNull;