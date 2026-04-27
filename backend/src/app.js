// Create Server
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const foodRoutes = require('./routes/food.routes');
const foodPartnerRoutes = require('./routes/food-partner.routes');
const cors = require('cors');

function normalizeOrigin(origin) {
    const trimmedOrigin = (origin || '').trim();

    if (!trimmedOrigin) {
        return null;
    }

    try {
        return new URL(trimmedOrigin).origin;
    } catch (error) {
        return trimmedOrigin.replace(/\/$/, '');
    }
}

const configuredOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

const allowedOrigins = new Set([
    ...configuredOrigins,
    'http://localhost:5173',
    'http://127.0.0.1:5173'
]);

const app = express();

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/food-partner', foodPartnerRoutes);

app.use((err, req, res, next) => {
    if (err?.message === 'Origin not allowed by CORS') {
        return res.status(403).json({
            message: 'Origin not allowed'
        });
    }

    console.error(err);

    return res.status(500).json({
        message: 'Server error'
    });
});

module.exports = app;
