const expect = require('chai').expect
const sinon = require('sinon')
const mongoose = require('mongoose')

const User = require('../models/user')
const authController = require('../controllers/auth')
const TEST_MONGODB_URL = require('../config/properties').TEST_MONGODB_URL

describe('Auth Controller', () => {
    before(done => {
        mongoose.connect(TEST_MONGODB_URL)
            .then(result => {
                const user = new User({
                    email: 'email',
                    password: '123',
                    name: 'Test',
                    posts: [],
                    _id: '5f1d38c4a55db863a9ce06f4'
                })
                return user.save()
            })
            .then(() => {
                done()
            })
    })


    it('should throw an error if accessing the database fails', done => {
        sinon.stub(User, 'findOne')
        User.findOne.throws()

        const req = {
            body: {
                email: '123',
                password: '123'
            }
        }

        authController.login(req, {}, () => { })
            .then(result => {
                expect(result).to.be.an('error')
                expect(result).to.have.property('statusCode', 500)
                done()
            })

        User.findOne.restore()
    })

    it('should send a response with a valid user status for an existing user', done => {
        const req = {
            userId: '5f1d38c4a55db863a9ce06f4'
        }
        const res = {
            statusCode: 500,
            userStatus: null,
            status(code) {
                this.statusCode = code
                return this
            },
            json(data) {
                this.userStatus = data.status
            }
        }
        authController.getStatus(req, res, () => { })
            .then(() => {
                expect(res.statusCode).to.be.equal(200)
                expect(res.userStatus).to.be.equal('New User')
            })
            .then(() => {
                done()
            })
    })

    after(done => {
        User.deleteMany()
            .then(() => {
                return mongoose.disconnect()
            })
            .then(() => {
                done()
            })
    })
})