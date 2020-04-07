const ErrorResponse = require('../utils/errorResponse')

const errorHandler = (err, req, res, next) => {
    console.log(err);
    let error = {
        ...err
    }
    // need to do this because err is not a common object copied fully with spread above.
    error.message = err.message
    // log to console for dev
    console.log(err.stack.red);

    // mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Bootcamp not found with id of ${err.value}`
        error = new ErrorResponse(message, 404)
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    })
}

module.exports = errorHandler