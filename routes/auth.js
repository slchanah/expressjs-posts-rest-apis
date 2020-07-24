const express = require('express')
const { body } = require('express-validator')

const User = require('../models/user')
const authController = require('../controllers/auth')

const router = express.Router()

router.put(
    '/signup',
    [
        body('email', 'Please enter a valid email.')
            .isEmail()
            .custom((value, { req }) => {
                return User.findOne({ email: value })
                    .then(user => {
                        if (user) {
                            return Promise.reject('E-mail already exists.')
                        }
                    })
            })
            .normalizeEmail(),
        body('password')
            .trim()
            .isLength({ min: 5 }),
        body('name')
            .trim()
            .not()
            .isEmpty()
    ],
    authController.signup)

router.post('/login', authController.login)

module.exports = router