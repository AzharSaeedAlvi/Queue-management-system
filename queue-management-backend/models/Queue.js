const mongoose = require('mongoose');

const QueueSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['case', 'call', 'break', 'manual', 'exception'] },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Queue', QueueSchema);
