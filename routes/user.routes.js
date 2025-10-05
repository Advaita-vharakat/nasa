const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userModel = require('../models/user.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth');

router.get('/login', (req, res) => {
    res.render('login');
})


router.post('/register',
    body('email').trim().isEmail().isLength({ min: 13 }),
    body('password').trim().isLength({ min: 5 }),
    body('username').trim().isLength({ min: 3 }),
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Invalid Data'
            })
        }

        res.status(200).json({ message: 'Registered successfully', redirect: '/user/login' });
        const { email, username, password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10)

        const newUser = await userModel.create({
            email,
            username,
            password: hashPassword
        })

        // res.json(newUser)
    })

router.post('/login',
    body('username').trim().isLength({ min: 3 }),
    body('password').trim().isLength({ min: 5 }),
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Invalid Data'
            })
        }

        const { username, password } = req.body;

        const user = await userModel.findOne({
            username: username
        })

        if (!user) {
            return res.status(400).json({
                message: 'invalid user or password'
            })
        }

        const ismatch = await bcrypt.compare(password, user.password)

        if (!ismatch) {
            return res.status(400).json({
                message: 'Invalid user or password'
            })
        }

        const token = jwt.sign({
            userId: user._id,
            email: user.email,
            username: user.username
        },
            process.env.JWT_SECRET,
        )


        res.cookie('token', token, {
            httpOnly: true,
            secure: false,  // ✅ must be false on localhost
            sameSite: 'lax', // works for redirects on same domain/port
            path: '/'
        });
        res.status(200).json({ message: 'Login successful', redirect: '/home' });
    })

router.get('/me', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.json({ loggedIn: false });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ loggedIn: true, username: decoded.username });
    } catch (err) {
        res.json({ loggedIn: false });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token', { path: '/' });
    res.json({ message: 'Logged out successfully' });
});


module.exports = router;