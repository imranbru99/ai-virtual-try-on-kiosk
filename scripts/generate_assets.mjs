import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(__dirname, '../packages/engine/demo/assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// SVG templates that render cleanly and scale to crisp PNG/SVG data
const assets = {
  'noir_silk_blazer.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 950" width="800" height="950">
  <defs>
    <linearGradient id="blazerBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#24262b"/>
      <stop offset="40%" stop-color="#141518"/>
      <stop offset="100%" stop-color="#0b0c0e"/>
    </linearGradient>
    <linearGradient id="satinLapel" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3d4048"/>
      <stop offset="50%" stop-color="#18191d"/>
      <stop offset="100%" stop-color="#2a2c33"/>
    </linearGradient>
    <linearGradient id="goldButton" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f6d365"/>
      <stop offset="100%" stop-color="#fda085"/>
    </linearGradient>
    <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
  </defs>

  <g filter="url(#subtleShadow)">
    <!-- Main Torso & Tailored Hems -->
    <path d="M 230 110 Q 400 170 570 110 L 670 280 L 610 880 L 400 870 L 190 880 L 130 280 Z" fill="url(#blazerBody)"/>
    
    <!-- Left Sleeve -->
    <path d="M 230 110 L 110 320 L 70 660 L 140 680 L 190 350 L 220 230 Z" fill="#18191d"/>
    <!-- Right Sleeve -->
    <path d="M 570 110 L 690 320 L 730 660 L 660 680 L 610 350 L 580 230 Z" fill="#18191d"/>

    <!-- Left Lapel (Satin Peak) -->
    <path d="M 330 140 L 270 340 L 370 420 L 370 560 L 340 560 L 250 360 L 300 140 Z" fill="url(#satinLapel)" stroke="#494d57" stroke-width="1.5"/>
    <!-- Right Lapel (Satin Peak) -->
    <path d="M 470 140 L 530 340 L 430 420 L 430 560 L 460 560 L 550 360 L 500 140 Z" fill="url(#satinLapel)" stroke="#494d57" stroke-width="1.5"/>

    <!-- Deep V Chest Opening -->
    <path d="M 330 140 Q 400 240 470 140 L 430 420 L 370 420 Z" fill="#0d0e10" opacity="0.3"/>

    <!-- Welt Pocket with Pocket Square -->
    <rect x="250" y="380" width="80" height="12" rx="2" fill="#2d3036" stroke="#40434b" stroke-width="1"/>
    <polygon points="275,380 290,355 305,380" fill="#f8fafc"/>

    <!-- Flap Pockets -->
    <rect x="200" y="600" width="130" height="32" rx="4" fill="#1c1d22" stroke="#33363e" stroke-width="1.5"/>
    <rect x="470" y="600" width="130" height="32" rx="4" fill="#1c1d22" stroke="#33363e" stroke-width="1.5"/>

    <!-- Gold Anchor Buttons -->
    <circle cx="400" cy="580" r="10" fill="url(#goldButton)" stroke="#d97706" stroke-width="1.5"/>
    <circle cx="400" cy="670" r="10" fill="url(#goldButton)" stroke="#d97706" stroke-width="1.5"/>
  </g>
</svg>`,

  'cashmere_crewneck.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900" width="800" height="900">
  <defs>
    <linearGradient id="knitIvory" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fdfbf7"/>
      <stop offset="50%" stop-color="#f5efe6"/>
      <stop offset="100%" stop-color="#e8dec8"/>
    </linearGradient>
    <linearGradient id="knitRib" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#eae0cf"/>
      <stop offset="100%" stop-color="#d8cca8"/>
    </linearGradient>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#554433" flood-opacity="0.25"/>
    </filter>
  </defs>

  <g filter="url(#softShadow)">
    <!-- Sweater Torso -->
    <path d="M 260 120 Q 400 160 540 120 L 640 280 L 590 820 L 210 820 L 160 280 Z" fill="url(#knitIvory)"/>
    
    <!-- Sleeves -->
    <path d="M 260 120 L 130 320 L 80 660 L 150 680 L 210 360 Z" fill="#f0e7d8"/>
    <path d="M 540 120 L 670 320 L 720 660 L 650 680 L 590 360 Z" fill="#f0e7d8"/>

    <!-- Crewneck Collar Ribbing -->
    <path d="M 330 115 Q 400 180 470 115 Q 400 145 330 115 Z" fill="url(#knitRib)" stroke="#c4b595" stroke-width="1.5"/>

    <!-- Bottom Hem Ribbing -->
    <rect x="210" y="780" width="380" height="40" rx="3" fill="url(#knitRib)"/>
    <line x1="210" y1="780" x2="590" y2="780" stroke="#c4b595" stroke-width="1.5"/>

    <!-- Subtle Knit Texture Lines -->
    <path d="M 300 240 Q 400 260 500 240 M 290 340 Q 400 360 510 340 M 280 440 Q 400 460 520 440 M 270 540 Q 400 560 530 540" stroke="#dfd4bd" stroke-width="1.5" fill="none" opacity="0.6"/>
  </g>
</svg>`,

  'aviator_sunglasses.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 250" width="600" height="250">
  <defs>
    <linearGradient id="goldFrame" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffe259"/>
      <stop offset="50%" stop-color="#d4af37"/>
      <stop offset="100%" stop-color="#996515"/>
    </linearGradient>
    <linearGradient id="lensGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e3c72" stop-opacity="0.90"/>
      <stop offset="50%" stop-color="#2a5298" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="#e65c00" stop-opacity="0.60"/>
    </linearGradient>
    <filter id="glassGlare">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <g filter="url(#glassGlare)">
    <!-- Top Brow Bar -->
    <path d="M 120 70 Q 300 55 480 70" stroke="url(#goldFrame)" stroke-width="6" fill="none" stroke-linecap="round"/>
    <!-- Nose Bridge -->
    <path d="M 260 90 Q 300 80 340 90" stroke="url(#goldFrame)" stroke-width="6" fill="none" stroke-linecap="round"/>

    <!-- Left Teardrop Lens -->
    <path d="M 140 80 C 130 150 180 215 250 205 C 285 200 290 140 285 85 C 230 75 170 75 140 80 Z" fill="url(#lensGrad)" stroke="url(#goldFrame)" stroke-width="6"/>
    <!-- Left Lens Specular Highlight -->
    <path d="M 160 95 C 155 125 175 155 195 150 C 205 145 190 110 180 95 Z" fill="#ffffff" opacity="0.35"/>

    <!-- Right Teardrop Lens -->
    <path d="M 460 80 C 470 150 420 215 350 205 C 315 200 310 140 315 85 C 370 75 430 75 460 80 Z" fill="url(#lensGrad)" stroke="url(#goldFrame)" stroke-width="6"/>
    <!-- Right Lens Specular Highlight -->
    <path d="M 440 95 C 445 125 425 155 405 150 C 395 145 410 110 420 95 Z" fill="#ffffff" opacity="0.35"/>

    <!-- Temples / Arms -->
    <path d="M 125 78 L 60 70" stroke="url(#goldFrame)" stroke-width="6" stroke-linecap="round"/>
    <path d="M 475 78 L 540 70" stroke="url(#goldFrame)" stroke-width="6" stroke-linecap="round"/>
  </g>
</svg>`,

  'emerald_evening_dress.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 1200" width="700" height="1200">
  <defs>
    <linearGradient id="emeraldSilk" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="45%" stop-color="#047857"/>
      <stop offset="85%" stop-color="#064e3b"/>
      <stop offset="100%" stop-color="#022c22"/>
    </linearGradient>
    <linearGradient id="silkSheen" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#34d399" stop-opacity="0.4"/>
      <stop offset="50%" stop-color="#047857" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#064e3b" stop-opacity="0.6"/>
    </linearGradient>
  </defs>

  <!-- Bodice -->
  <path d="M 230 100 Q 350 140 470 100 L 450 300 Q 350 330 250 300 Z" fill="url(#emeraldSilk)"/>
  <!-- V-Neck Drape -->
  <path d="M 270 100 Q 350 220 430 100 L 390 280 Q 350 300 310 280 Z" fill="#022c22" opacity="0.3"/>
  <!-- Waist Cincher -->
  <path d="M 250 300 Q 350 330 450 300 L 460 380 Q 350 400 240 380 Z" fill="#065f46" stroke="#10b981" stroke-width="1"/>
  <!-- Flowing Gown Skirt -->
  <path d="M 240 380 Q 350 400 460 380 L 620 1150 Q 350 1190 80 1150 Z" fill="url(#emeraldSilk)"/>
  <!-- Satin Pleat Sheens -->
  <path d="M 330 390 Q 340 750 260 1160" stroke="#6ee7b7" stroke-width="3" fill="none" opacity="0.4"/>
  <path d="M 370 390 Q 380 750 440 1160" stroke="#6ee7b7" stroke-width="3" fill="none" opacity="0.4"/>
</svg>`
};

for (const [name, content] of Object.entries(assets)) {
  const filePath = path.join(assetsDir, name);
  fs.writeFileSync(filePath, content.trim());
  console.log(`Generated: ${filePath}`);
}
console.log('Sample assets generation completed successfully.');
