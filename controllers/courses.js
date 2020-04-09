const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async') 
const Course = require('../models/Course')
const Bootcamp = require('../models/Bootcamp')

// @desc        Get courses
// @route       GET /api/v1/courses
// @route       GET /api/v1/bootcamps/:bootcampId/courses
// @access      Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    if(req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId })
        return res.status(200).json({
            succes: true,
            count: courses.length,
            data: courses
        })
    } else {
        res.status(200).json(res.advancedResults)
    }
})

// @desc        Get single course
// @route       GET /api/v1/courses/:id
// @access      Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    let selectParams = "name description"
    //custom params is needed
    if(req.query.selectBootcampValues) selectParams = req.query.selectBootcampValues.replace(/,/g, " ")
       
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: selectParams
    })

    if(!course) {
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404))
    }

    res.status(200).json({ 
        success: true,
        data: course
    })
})

// @desc        Add a course
// @route       POST /api/v1/bootcamps/:bootcampId/courses
// @access      Private
exports.addCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if(!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`, 404))
    }

    const course = await Course.create(req.body)

    res.status(200).json({ 
        success: true,
        data: course
    })
})

// @desc        Update a course
// @route       PUT /api/v1/courses/:id
// @access      Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id)

    if(!course) {
        return next(new ErrorResponse(`No course found with the id of ${req.params.bootcampId}`, 404))
    }

    //update course values
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({ 
        success: true,
        data: course
    })
})

// @desc        Delete a course
// @route       DELETE /api/v1/courses/:id
// @access      Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id)

    if(!course) {
        return next(new ErrorResponse(`No course found with the id of ${req.params.bootcampId}`, 404))
    }

    //update course values
    await course.remove()

    res.status(200).json({ 
        success: true,
        data: {}
    })
})














// **********************************************************************************************************
// old getCourses. used to check n the query process for custom queries on bootcamp fields within courses
/*
exports.getCourses = asyncHandler(async (req, res, next) => {
    let query;

    if(req.params.bootcampId) {
        query = Course.find({ bootcamp: req.params.bootcampId })
    } else {
        let selectParams = "name description"
        //custom params is needed
        // if(req.query.selectBootcampValues) selectParams = req.query.selectBootcampValues.replace(/,/g, " ")
        query = Course.find().populate({
            path: 'bootcamp',
            select: selectParams
        })
    }

    const courses = await query

    res.status(200).json({ 
        success: true,
        count: courses.length,
        data: courses
    })
})
*/