const express = require('express')
const { register, login, getMe, forgotPassword } = require('../controllers/auth')

const router = express.Router()

// middleware to decode + verify JWT token. Wherever protect is applied, user needs to be logged in
const { protect } = require('../middleware/auth')

router.post('/register', register)
router.post('/login', login)
router.post('/forgotpassword', forgotPassword)

router.route('/me').get(protect, getMe)


module.exports = router