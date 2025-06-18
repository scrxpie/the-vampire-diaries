const cron = require('node-cron');
const Partner = require('../models/Partner');

module.exports = () => {
    // 🕛 Her gece 00:00'da daily reset
    cron.schedule('0 0 * * *', async () => {
        console.log('[⏰] Günlük partner verileri sıfırlanıyor...');
        await Partner.updateMany({}, { daily: 0 });
    });

    // 📅 Her Pazar gece 00:00'da weekly reset
    cron.schedule('0 0 * * 0', async () => {
        console.log('[⏰] Haftalık partner verileri sıfırlanıyor...');
        await Partner.updateMany({}, { weekly: 0 });
    });

    // 📆 Her ayın 1'i gece 00:00'da monthly reset
    cron.schedule('0 0 1 * *', async () => {
        console.log('[⏰] Aylık partner verileri sıfırlanıyor...');
        await Partner.updateMany({}, { monthly: 0 });
    });
};
