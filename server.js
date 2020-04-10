const path = require('path')
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const errorHandler = require('./middleware/error')
const connectDB = require('./config/db');
// load env vars
dotenv.config({
  path: './config/config.env',
});

// connect DB
connectDB();

// route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth')

const app = express();

//********************************** Middleware ********************************** 
// body parser
app.use(express.json());

// cookie parser
app.use(cookieParser())

// dev loggin environment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// file uploading
app.use(fileupload())

// set static folder
app.use(express.static(path.join(__dirname, 'public')))

// mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);

// custom err handler
app.use(errorHandler)


//********************************** Server ********************************** 

const PORT = process.env.PORT || 4000;

const server = app.listen(
  PORT,
  console.log(`port: ${PORT}; env: ${process.env.NODE_ENV}`.yellow.bold)
);

// handle unhandles promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  //close server & exit process
  server.close(() => process.exit(1));
});