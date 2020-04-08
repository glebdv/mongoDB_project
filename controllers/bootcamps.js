const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')
const Bootcamp = require('../models/Bootcamp')
// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    let query

    //copy query
    const reqQuery = { ...req.query }

    //fields to exclude
    const removeFiels = ['select', 'sort', 'page', 'limit']

    //loop over remove fields and delete them from requestQuery
    removeFiels.forEach(param => delete reqQuery[param])
    
    //create query string
    let queryStr = JSON.stringify(reqQuery)
    
    //create query string by params + use 
    //gt = greater than; lt = lower than; e = equal; in = in array ex: careers[in]=Business
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)
    
    //find resource
    query = Bootcamp.find(JSON.parse(queryStr))

    //select fields
    if(req.query.select) {
        const fields = req.query.select.replace(/,/g, " ")
        console.log(fields);
        query = query.select(fields)
    }

    //sort
    if(req.query.sort) {
        const sortBy = req.query.sort.replace(/,/g, " ") //specific synthax
        query = query.sort(sortBy)
    } else {
        query = query.sort('-createdAt')
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 25
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await Bootcamp.countDocuments()

    query.skip(startIndex).limit(limit)

    //get result
    const bootcamps = await query

    //Pagination result
    const pagination = {}
    if(endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if(startIndex > 0) {
        pagination.prev = {
            page: page -1,
            limit
        }
    }

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        pagination,
        data: bootcamps,
    });
});

// @desc        Get bootcamp
// @route       GET /api/v1/bootcamps/:id
// @access      Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        data: bootcamp,
    });
});

// @desc        Create new bootcamp
// @route       POST /api/v1/bootcamps
// @access      Private
exports.createBootcamps = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }
    //@TODO: add error handler for "slug" since user would have to change the name.

    res.status(201).json({
        success: true,
        data: bootcamp,
    });
});

// @desc        Update bootcamp
// @route       PUT /api/v1/bootcamps/:id
// @access      Private
exports.updateBootcamps = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(
        req.params.id,
        req.body, {
            new: true, //gives back new values
            runValidators: true,
        }
    );

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        data: bootcamp,
    });
});

// @desc        Delete bootcamp
// @route       DELETE /api/v1/bootcamps/:id
// @access      Private
exports.deleteBootcamps = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        data: {},
    });
});

// @desc        Get bootcamps within a radius
// @route       GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access      Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params

    // Get lat+long from geocoder
    const loc = await geocoder.geocode(zipcode)
    console.log('LOCATION: ', loc);
    const lat = loc[0].latitude
    const lng = loc[0].longitude

    // calc radius using radians
    // divide distance by radius of earth
    // radius earth = 3,963 mi / 6,378 km
    const radius = distance / 6378

    const bootcamps = await Bootcamp.find({
        location: { 
            $geoWithin: { 
                $centerSphere: [ [lng, lat], radius ] 
            }
        }
    })

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })
});