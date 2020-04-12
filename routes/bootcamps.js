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

// Include other resource routers (because of url types in courses) @IMP
// i.e.: course and reviews both bind to Bootcamps, so we have to use them 
const courseRouter = require('./courses')
const reviewRouter = require('./reviews')

const router = express.Router();

// ************************************MIDDLEWARE
// pagination, filter and search
const advancedResults = require('../middleware/advancedResults')
// middleware to decode + verify JWT token. Wherever protect is applied, user needs to be logged in
const { protect, authorize } = require('../middleware/auth')

// re-route into other resource routers.
// @IMP look at the courseRouter/reviewRouter. These queries get routed there
router.use('/:bootcampId/courses', courseRouter)
router.use('/:bootcampId/reviews', reviewRouter)

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