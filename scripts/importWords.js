const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const WordModel = require('../models/Words'); // Path'i senin yapına göre düzelt

const jsonPath = path.join(__dirname, 'data.json');

mongoose.connect('mongodb://localhost:27017/veritabaniAdi', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log("✅ MongoDB bağlantısı başarılı.");

  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(rawData);

  for (const [userId, userData] of Object.entries(data)) {
    const newData = {
      _id: userId,
      words: userData.words || 0,
      lastLevel: userData.level || 0,
      weeklyWords: 0,
      dailyWords: 0,
      longestEmote: 0,
      lastUpdate: new Date()
    };

    await WordModel.updateOne(
      { _id: userId },
      { $set: newData },
      { upsert: true }
    );
  }

  console.log("✅ Veriler başarıyla MongoDB'ye aktarıldı.");
  mongoose.disconnect();
}).catch(err => {
  console.error("❌ MongoDB bağlantı hatası:", err);
});
