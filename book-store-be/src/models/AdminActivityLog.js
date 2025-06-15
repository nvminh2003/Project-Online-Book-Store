const mongoose = require('mongoose');

const AdminActivityLogSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    action: { type: String, required: true },
    details: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AdminActivityLog', AdminActivityLogSchema);
