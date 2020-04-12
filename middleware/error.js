const ErrorResponse = require('../utils/errorResponse')

const errorHandler = (err, req, res, next) => {
    console.log(err);
    let error = {
        ...err
    }
    // need to do this because err is not a common object copied fully with spread above.
    error.message = err.message
    // log to console for dev
    console.log(err);

    // mongoose bad ObjectId
    if (err.name === 'CastError') {
        const splitMessage = err.message.split(" ")
        const modelName = splitMessage[splitMessage.length - 1]
        // const message = `Resource (model name: ${modelName}) not found with id of ${err.value}`
        const message = "Resource not found"
        error = new ErrorResponse(message, 404)
    }

    // mongoose duplicate key
    if (err.code === 11000) {
        const message = `Duplicate key. Please use a different ${Object.keys(err.keyValue)}`
        error = new ErrorResponse(message, 400)
    }

    // mongoose validation (required) error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(error => " " + error.message)
        error = new ErrorResponse(message, 400)
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    })
}

module.exports = errorHandler