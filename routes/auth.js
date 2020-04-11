const express = require('express')
const { 
    register, 
    login, 
    getMe, 
    forgotPassword, 
    resetPassword, 
    updateDetails, 
    updatePassword 
} = require('../controllers/auth')

const router = express.Router()

// middleware to decode + verify JWT token. Wherever protect is applied, user needs to be logged in
const { protect } = require('../middleware/auth')

router.post('/register', register)
router.post('/login', login)
router.post('/forgotpassword', forgotPassword)
router.put('/resetpassword/:resettoken', resetPassword)

router.route('/updatedetails').put(protect, updateDetails)
router.route('/updatepassword').put(protect, updatePassword)
router.route('/me').get(protect, getMe)


module.exports = router