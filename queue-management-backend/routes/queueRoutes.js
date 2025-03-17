const express = require('express');
const Queue = require('../models/Queue');

const router = express.Router();

// Add to queue
router.post('/add', async (req, res) => {
    const { userId, type } = req.body;
    
    try {
        const queueEntry = new Queue({ userId, type });
        await queueEntry.save();
        res.json({ message: 'Added to queue' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get queue
router.get('/', async (req, res) => {
    const queue = await Queue.find().populate('userId', 'name');
    res.json(queue);
});

module.exports = router;
