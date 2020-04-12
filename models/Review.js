const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a title for the review'],
        maxlength: 100
    },
    text: {
        type: String,
        required: [true, 'Please add text to your review']
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add a rating between 1 and 10']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp', //needs to reference the model
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', //needs to reference the model
        required: true
    }
})

// user can only add 1 review per one bootcamp! @IMP really cool :))
ReviewSchema.index({ bootcamp: 1, user: 1}, { unique: true })

// static method to get avg of rating of the tuitions
ReviewSchema.statics.getAverageRating = async function(bootcampId) {
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: '$bootcamp',
                averageRating: { $avg: '$rating' }
            }
        }
    ])
    
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating: obj[0].averageRating
        })
    } catch (error) {
        console.log(error);
    }
}

// call getAverageRating after save
ReviewSchema.post('save', function(next) {
    this.constructor.getAverageRating(this.bootcamp)
    // next()
})

// call getAverageRating after remove
ReviewSchema.pre('remove', function(next) {
    this.constructor.getAverageRating(this.bootcamp)
    next()
})


module.exports = mongoose.model('Review', ReviewSchema)