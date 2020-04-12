const express = require('express');
const { 
    getUsers, 
    getUser, 
    createUser, 
    updateUser, 
    deleteUser 
} = require('../controllers/users.js');

// model
const User = require('../models/User')

const router = express.Router({ mergeParams: true });

// ************************************MIDDLEWARE
// pagination, filter and search
// 1st param => model; 1nd param => what are we adding? in this case
const advancedResults = require('../middleware/advancedResults')
// middleware to decode + verify JWT token. Wherever protect is applied, user needs to be logged in
const { protect, authorize } = require('../middleware/auth')

router.use(protect)
router.use(authorize('admin'))
// anything below this line, will use the middleware above ^ so all routes will be protected

router.route('/')
.get(advancedResults(User), getUsers)
.post(createUser) 

router.route('/:id')
.get(getUser)
.put(updateUser)
.delete(deleteUser)

module.exports = router;