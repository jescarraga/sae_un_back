var express = require("express");
var path = require("path");
var createError = require("http-errors");
//var cookieParser = require('cookie-parser');
var logger = require("morgan");
var cors = require("cors");


var indexRouter = require("./routes/index");
var docenteRouter = require("./routes/ingresoDocente");
var bienestarRouter = require("./routes/bienestar");
var ingresoEstudianteRouter = require("./routes/ingresoEstudiante");
var ingresoTutorRouter = require("./routes/ingresoTutor");
var observacionesRouter = require("./routes/observaciones");
var remisionesDocenteRouter = require("./routes/remisionesDocente");
const remisionesBienestar = require('./routes/remisionesBienestar');
const solicitarTutoria = require("./routes/solicitarTutoria");


var app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/", ingresoEstudianteRouter);
app.use("/", bienestarRouter);
app.use("/", docenteRouter);
app.use("/", ingresoTutorRouter);
app.use("/", observacionesRouter);
app.use("/", remisionesDocenteRouter);
app.use('/', remisionesBienestar);
app.use("/",solicitarTutoria);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// app.listen( 3500, () =>{
//   console.log('corriendo el proyectico')
// })

module.exports = app;
