const express = require('express');
const { getCourses, getCourse, addCourse, updateCourse, deleteCourse } = require('../controllers/courses.js');

// model
const Course = require('../models/Course')
// pagination, filter and search
// 1st param => model; 1nd param => what are we adding? in this case
const advancedResults = require('../middleware/advancedResults')

const router = express.Router({ mergeParams: true });

// middleware to decode + verify JWT token. Wherever protect is applied, user needs to be logged in
const { protect, authorize } = require('../middleware/auth')

router.route('/')
.get(
    advancedResults(Course, {
        path: 'bootcamp',
        select: "name description" //@TODO: be able to change select params. look @ getCourses => controllers
    }),
    getCourses
)
.post(protect, authorize('publisher', 'admin'), addCourse)

router.route('/:id')
.get(getCourse)
.put(protect, authorize('publisher', 'admin'), updateCourse)
.delete(protect, authorize('publisher', 'admin'), deleteCourse)

module.exports = router;