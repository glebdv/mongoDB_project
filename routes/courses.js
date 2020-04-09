const express = require('express');
const { getCourses, getCourse, addCourse, updateCourse, deleteCourse } = require('../controllers/courses.js');

// model
const Course = require('../models/Course')
// pagination, filter and search
// 1st param => model; 1nd param => what are we adding? in this case
const advancedResults = require('../middleware/advancedResults')

const router = express.Router({ mergeParams: true });

router.route('/')
.get(
    advancedResults(Course, {
        path: 'bootcamp',
        select: "name description" //@TODO: be able to change select params. look @ getCourses => controllers
    }),
    getCourses
)
.post(addCourse)

router.route('/:id')
.get(getCourse)
.put(updateCourse)
.delete(deleteCourse)

module.exports = router;