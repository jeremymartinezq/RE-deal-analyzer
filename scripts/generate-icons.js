const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48, 128];
const outputDir = path.join(__dirname, '../icons');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function drawIcon(size, disabled = false) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background circle
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - size/10, 0, Math.PI * 2);
  ctx.fillStyle = disabled ? '#999999' : '#2196f3';
  ctx.fill();

  // House
  const houseColor = disabled ? '#cccccc' : '#ffffff';
  ctx.fillStyle = houseColor;
  
  // Roof
  ctx.beginPath();
  ctx.moveTo(size/2, size/5);
  ctx.lineTo(size/5, size/2);
  ctx.lineTo(4*size/5, size/2);
  ctx.closePath();
  ctx.fill();

  // House body
  ctx.fillRect(size/3, size/2, size/3, size/3);

  // Graph line
  ctx.beginPath();
  ctx.moveTo(size/3, 2*size/3);
  ctx.lineTo(size/2, size/2);
  ctx.lineTo(2*size/3, 3*size/5);
  ctx.strokeStyle = houseColor;
  ctx.lineWidth = Math.max(1, size/16);
  ctx.stroke();

  return canvas;
}

// Generate icons for each size
sizes.forEach(size => {
  // Regular icon
  const canvas = drawIcon(size);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, `icon${size}.png`), buffer);
  console.log(`Generated icon${size}.png`);

  // Disabled icon
  const disabledCanvas = drawIcon(size, true);
  const disabledBuffer = disabledCanvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, `icon${size}-disabled.png`), disabledBuffer);
  console.log(`Generated icon${size}-disabled.png`);
}); 