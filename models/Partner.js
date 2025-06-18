const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
    userID: { type: String, required: true }, // Partner yapan kişi

    // Sayımlar
    daily: { type: Number, default: 0 },      // Günlük partner sayısı
    weekly: { type: Number, default: 0 },     // Haftalık partner sayısı
    monthly: { type: Number, default: 0 },    // Aylık partner sayısı
    total: { type: Number, default: 0 },      // Toplam partner sayısı

    // Partner geçmişi (log)
    logs: [{
        serverName: String,                   // Partner yapılan sunucu adı veya linki
        date: { type: Date, default: Date.now } // Partnerlik zamanı
    }]
});

module.exports = mongoose.model("Partner", partnerSchema);
