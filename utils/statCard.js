const { createCanvas, loadImage } = require('canvas');
const path = require('path');

function drawBar(ctx, x, y, value, max = 5) {
  const filled = value;
  const empty = max - value;
  const size = 20;
  for (let i = 0; i < filled; i++) {
    ctx.fillStyle = '#3B82F6'; // mavi
    ctx.fillRect(x + i * (size + 5), y, size, size);
  }
  for (let i = 0; i < empty; i++) {
    ctx.fillStyle = '#1F2937'; // gri
    ctx.fillRect(x + (filled + i) * (size + 5), y, size, size);
  }
}

async function generateStatCard(user, statVerisi) {
  const canvas = createCanvas(700, 500);
  const ctx = canvas.getContext('2d');

  // Arkaplan
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Başlık
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px Sans';
  ctx.fillText(`${user.username} (${statVerisi.tur})`, 30, 50);

  // Statlar
  ctx.font = '20px Sans';
  const stats = {
    Güç: statVerisi.guc || 0,
    Direnç: statVerisi.direnc || 0,
    Odak: statVerisi.odak || 0,
    İrade: statVerisi.irade || 0,
    Karizma: statVerisi.karizma || 0,
    Zeka: statVerisi.zeka || 0,
    Reflex: statVerisi.reflex || 0,
  };

  const isHunter = statVerisi.tur === "Avcı";
  const allowedStats = isHunter
    ? ['Güç', 'Direnç', 'Odak', 'İrade', 'Karizma', 'Zeka', 'Reflex']
    : ['Güç', 'Direnç', 'Odak', 'Karizma', 'Zeka'];

  let i = 0;
  for (const key of allowedStats) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${key}:`, 30, 100 + i * 40);
    drawBar(ctx, 150, 80 + i * 40, stats[key]);
    i++;
  }

  // Stat hakkı
  ctx.fillStyle = '#10B981';
  ctx.fillText(`🎁 Stat Hakkı: ${statVerisi.hak || 0}`, 30, 100 + i * 40 + 30);

  return canvas.toBuffer();
}

module.exports = generateStatCard;
