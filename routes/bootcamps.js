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

//re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter)

router
  .route('/radius/:zipcode/:distance')
  .get(getBootcampsInRadius)

router
  .route('/:id/photo')
  .put(bootcampPhotoUpload)

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)//pagination
  .post(createBootcamps);

router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamps)
  .delete(deleteBootcamps);



module.exports = router;