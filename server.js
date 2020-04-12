const path = require('path')
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')
const errorHandler = require('./middleware/error')
const connectDB = require('./config/db');
// load env vars
dotenv.config({
  path: './config/.env',
});

// connect DB
connectDB();

// route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth')
const users = require('./routes/users')
const reviews = require('./routes/reviews')

const app = express();

//********************************** Middleware ********************************** 
// body parser. auto parse json
app.use(express.json());

// cookie parser (can now use cookies ;))
app.use(cookieParser())

// dev loggin environment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// file uploading
app.use(fileupload())

// sanitize data. avoid noSQL injections
app.use(mongoSanitize())

// add security headers
app.use(helmet())

// prevent XSS attacks
app.use(xss())

// rate limiting. can attach to specific routes and such (like password reset)
app.use(rateLimit({
  windowMs: 10 * 60 * 100,
  max: 100
}))

// prevent http param pollution
app.use(hpp())

// enable cors so that others can use our API
app.use(cors())

// set static folder
app.use(express.static(path.join(__dirname, 'public')))

// mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users)
app.use('/api/v1/reviews', reviews)

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