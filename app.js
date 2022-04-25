var express = require('express');
var path = require('path');
var createError = require('http-errors');
//var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var ingresoEstudianteRouter = require('./routes/ingresoEstudiante');
const cors = require('cors');

var app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());


//app.use(cookieParser());

app.use('/', indexRouter);
app.use('/', ingresoEstudianteRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// app.listen( 3500, () =>{
//   console.log('corriendo el proyectico')
// })

module.exports = app;
