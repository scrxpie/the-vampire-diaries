const fs = require('fs');
const path = require('path');
const WordModel = require('../models/Words');

const jsonPath = path.join(__dirname, 'data.json');

async function importWordsData() {
  if (!fs.existsSync(jsonPath)) {
    console.log("⏩ data.json bulunamadı, atlandı.");
    return;
  }

  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(rawData);

  for (const [userId, userData] of Object.entries(data)) {
    await WordModel.updateOne(
      { _id: userId },
      {
        $set: {
          words: userData.words || 0,
          lastLevel: userData.level || 0,
          weeklyWords: 0,
          dailyWords: 0,
          longestEmote: 0,
          lastUpdate: new Date()
        }
      },
      { upsert: true }
    );
  }
  console.log("✅ JSON verisi MongoDB'ye aktarıldı.");
}

module.exports = importWordsData;
