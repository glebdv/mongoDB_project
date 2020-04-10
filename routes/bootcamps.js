const express = require('express');
const {
  getBootcamp,
  getBootcamps,
  updateBootcamps,
  createBootcamps,
  deleteBootcamps,
  getBootcampsInRadius,
  bootcampPhotoUpload
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp')
// pagination, filter and search
const advancedResults = require('../middleware/advancedResults')

//Include other resource routers (because of url types in courses)
const courseRouter = require('./courses')

const router = express.Router();

// middleware to decode + verify JWT token. Wherever protect is applied, user needs to be logged in
const { protect, authorize } = require('../middleware/auth')

//re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter)

router
  .route('/radius/:zipcode/:distance')
  .get(getBootcampsInRadius)

router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload)

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)//pagination
  .post(protect, authorize('publisher', 'admin'), createBootcamps);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamps)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamps);



module.exports = router;