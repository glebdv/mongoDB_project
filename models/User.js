const crypto = require('crypto')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email',
        ],
    },
    role: {
        type: String,
        enum: ['user', 'publisher'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
    // bottom lines will run only if pass was modified
    if(!this.isModified('password')) {
        next()
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

// sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign(
        { 
            id: this._id 
        }, 
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE
        }
    )
}

// match user password to hashed password in db
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

// generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
    // generate token. randomBytes gives Buffer so we tostring it @IMP
    const resetToken = crypto.randomBytes(20).toString('hex')

    // hash token and set to resetPasswordToken field. We can access resetPasswordToken with "this" because it's in the schema
    this.resetPasswordToken = crypto
        .createHash('sha256')   
        .update(resetToken)
        .digest('hex')

    // set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000

    // reset original reset token (not hashed)
    return resetToken
}

module.exports = mongoose.model('User', UserSchema)