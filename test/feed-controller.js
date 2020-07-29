const expect = require('chai').expect
const sinon = require('sinon')
const mongoose = require('mongoose')

const User = require('../models/user')
const Post = require('../models/posts')
const feedController = require('../controllers/feed')
const TEST_MONGODB_URL = require('../config/properties').TEST_MONGODB_URL
const io = require('../socket')

describe('Feed Controller', () => {
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

    it('should add a post in user after creating a post', done => {
        const req = {
            body: {
                title: 'Test Post',
                content: 'Test Post'
            },
            file: {
                path: 'abc'
            },
            userId: '5f1d38c4a55db863a9ce06f4'
        }

        const res = {
            status() { return this },
            json() { }
        }

        const stub = sinon.stub(io, 'getIO').callsFake(() => {
            return {
                emit: function () { }
            }
        });

        feedController.createPost(req, res, () => { })
            .then(updatedUser => {
                expect(updatedUser).to.have.property('posts')
                expect(updatedUser.posts).to.have.length(1)
                stub.restore()
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