const path = require('path')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')
const Bootcamp = require('../models/Bootcamp')

// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
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
    // add user to req.body
    req.body.user = req.user.id

    // Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id })

    // if user is not admin, they can only add 1 bootcamp
    if(publishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`, 400))
    }

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
    // const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id); // not "AndDelete" because models at remove middleware won't trigger this function. Thats why we remove later
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    bootcamp.remove()

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

// @desc        Upload photo for bootcamp
// @route       PUT /api/v1/bootcamps/:id/photo
// @access      Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    // const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id); // not "AndDelete" because models at remove middleware won't trigger this function. Thats why we remove later
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    if (!req.files) {   
        return next(new ErrorResponse(`Please upload a file`, 400))
    }

    console.log(req.files);

    const file = req.files.file

    // make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400))
    }

    // check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {   
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD} bytes (1 mb = 1000000 bytes)`, 400))
    }

    // create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.log(err);
            return next(new ErrorResponse(`Problem with file upload`, 500))
        }
        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })

        res.status(200).json({ success: true, data: file.name })
    })
});