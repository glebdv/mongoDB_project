const express = require('express');
const {
  getBootcamp,
  getBootcamps,
  updateBootcamps,
  createBootcamps,
  deleteBootcamps,
  getBootcampsInRadius,
} = require('../controllers/bootcamps');

const router = express.Router();

router
  .route('/radius/:zipcode/:distance')
  .get(getBootcampsInRadius)

router
  .route('/')
  .get(getBootcamps)
  .post(createBootcamps);

router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamps)
  .delete(deleteBootcamps);



module.exports = router;