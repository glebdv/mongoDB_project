const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async') 
const Review = require('../models/Review')
const Bootcamp = require('../models/Bootcamp')

// @desc        Get reviews
// @route       GET /api/v1/reviews
// @route       GET /api/v1/bootcamps/:bootcampId/reviews
// @access      Public
exports.getReviews = asyncHandler(async (req, res, next) => {
    // sends only specific bootcamp reviews
    if(req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp: req.params.bootcampId })
        
        return res.status(200).json({
            succes: true,
            count: reviews.length,
            data: reviews
        })
    // sends all reviews with pagination
    } else {
        res.status(200).json(res.advancedResults)
    }
})

// @desc        Get single review
// @route       GET /api/v1/reviews/:id
// @access      Public
exports.getReview = asyncHandler(async (req, res, next) => {
    // @IMP: populate basically means "add"
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    })

    if(!review) {
        return next(new ErrorResponse(`No review found with the id of ${req.params.id}`, 404))
    }

    return res.status(200).json({
        succes: true,
        data: review
    })
})

// @desc        Create new review
// @route       POST /api/v1/bootcamps/:bootcampId/reviews
// @access      Private
exports.createReview = asyncHandler(async (req, res, next) => {
    // insert bootcampId and userId so that they can get populated in the Schema
    req.body.bootcamp = req.params.bootcampId
    //can only get that because of the "protected" param that is passed in the "routes/reviews.js" @IMP
    req.body.user = req.user.id 

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if(!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`, 404))
    }

    const review = await Review.create(req.body)
    
    return res.status(201).json({
        succes: true,
        data: review
    })
})

// @desc        Update review
// @route       PUT /api/v1/reviews/:id
// @access      Private
exports.updateReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id)

    if(!review) {
        next(new ErrorResponse(`The review with id ${req.params.id} does not exist `, 404))
    }

    if(req.user.id !== review.user.toString() && req.user.role !== 'admin') {
        next(new ErrorResponse(`Not authorized to edit review ${req.review._id}`, 401))
    }

    //update review values
    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    
    return res.status(200).json({
        succes: true,
        data: review
    })
})

// @desc        Delete review
// @route       PUT /api/v1/reviews/:id
// @access      Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById({ _id: req.params.id })

    if(!review) {
        next(new ErrorResponse(`The review with id ${req.params.id} does not exist `, 404))
    }

    if(req.user.id !== review.user.toString() && req.user.role !== 'admin') {
        next(new ErrorResponse(`Not authorized to delete review ${req.review._id}`, 401))
    }

    //update review values
    review = await Review.findByIdAndDelete(req.params.id)
    
    return res.status(200).json({
        succes: true,
        data: {}
    })
})


