const express = require('express');
const { 
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview
} = require('../controllers/reviews.js');

// model
const Review = require('../models/Review')

const router = express.Router({ mergeParams: true });

// ************************************ MIDDLEWARE
// pagination, filter and search
// 1st param => model; 1nd param => what are we adding? in this case
const advancedResults = require('../middleware/advancedResults')
// middleware to decode + verify JWT token. Wherever protect is applied, user needs to be logged in
const { protect, authorize } = require('../middleware/auth')

router.route('/')
.get(
    advancedResults(Review, {
        path: 'bootcamp',
        select: 'name description' //@TODO: be able to change select params. look @ getCourses => controllers
    }),
    getReviews
)
.post(protect, authorize('user', 'admin'), createReview)

router.route('/:id')
.get(getReview)
.put(protect, authorize('user', 'admin'), updateReview)
.delete(protect, authorize('user', 'admin'), deleteReview)

module.exports = router;