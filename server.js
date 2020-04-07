const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
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

const app = express();

//********************************** Middleware ********************************** 
// body parser
app.use(express.json());

// dev loggin environment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// mount routers
app.use('/api/v1/bootcamps', bootcamps);

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