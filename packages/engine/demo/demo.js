import { TryOnEngine } from '../dist/TryOnEngine.js';
import { AssetPipeline } from '../dist/pipeline/AssetPipeline.js';

// Kiosk Product Catalog
const CATALOG = [
  {
    id: 'prod-blazer-01',
    name: 'Noir Silk Blazer',
    category: 'outerwear',
    categoryLabel: 'NOIR SILK BLAZER / OUTERWEAR',
    cutoutUrl: 'assets/noir_silk_blazer.svg',
    price: '$1,250',
    anchorMap: AssetPipeline.generateDefaultAnchorMap('outerwear'),
    colors: [
      { name: 'Noir Black', hex: '#141518' },
      { name: 'Camel Tan', hex: '#b08968' },
      { name: 'Oxford Navy', hex: '#1e293b' },
      { name: 'Burgundy', hex: '#4a0e17' }
    ]
  },
  {
    id: 'prod-crewneck-02',
    name: 'Cashmere Crewneck',
    category: 'tops',
    categoryLabel: 'CASHMERE CREWNECK / TOPS',
    cutoutUrl: 'assets/cashmere_crewneck.svg',
    price: '$680',
    anchorMap: AssetPipeline.generateDefaultAnchorMap('tops'),
    colors: [
      { name: 'Ivory Cream', hex: '#f5efe6' },
      { name: 'Charcoal', hex: '#334155' },
      { name: 'Sage Green', hex: '#52796f' }
    ]
  },
  {
    id: 'prod-dress-03',
    name: 'Emerald Evening Dress',
    category: 'dresses',
    categoryLabel: 'EMERALD EVENING DRESS / COUTURE',
    cutoutUrl: 'assets/emerald_evening_dress.svg',
    price: '$1,890',
    anchorMap: AssetPipeline.generateDefaultAnchorMap('dresses'),
    colors: [
      { name: 'Emerald', hex: '#059669' },
      { name: 'Midnight', hex: '#0f172a' },
      { name: 'Ruby', hex: '#881337' }
    ]
  },
  {
    id: 'prod-eyewear-04',
    name: 'Gold Aviators',
    category: 'eyewear',
    categoryLabel: 'GOLD POLARIZED AVIATORS / EYEWEAR',
    cutoutUrl: 'assets/aviator_sunglasses.svg',
    price: '$420',
    anchorMap: AssetPipeline.generateDefaultAnchorMap('eyewear'),
    colors: [
      { name: 'Gold & Blue', hex: '#d4af37' },
      { name: 'Rose Gold', hex: '#e0a96d' },
      { name: 'Black Gunmetal', hex: '#27272a' }
    ]
  }
];

class KioskDemoApp {
  constructor() {
    this.engine = new TryOnEngine({
      targetFps: 60,
      enableOneEuroFilter: true,
      debugOverlay: {
        showLandmarks: false,
        showAnchors: false,
        showBoundingBoxes: false,
        showFps: true,
        showJitterGraph: false
      }
    });

    this.activeCategory = 'all';
    this.selectedProductIndex = 0;
    this.selectedVariantHex = null;
    this.layerEyewear = false;
    this.useWebcam = false;
    this.videoStream = null;
    this.animFrameId = null;

    // Elements
    this.videoEl = document.getElementById('camera-video');
    this.canvasEl = document.getElementById('tryon-canvas');
    this.ctx = this.canvasEl.getContext('2d');
    this.carouselTrack = document.getElementById('carousel-track');
    this.productNameEl = document.getElementById('product-name');
    this.categoryLabelEl = document.getElementById('category-label');
    this.productPriceEl = document.getElementById('product-price');
    this.variantsRow = document.getElementById('variants-row');
    this.countdownOverlay = document.getElementById('countdown-overlay');
    this.countdownNumber = document.getElementById('countdown-number');
    this.flashOverlay = document.getElementById('flash-overlay');
    this.resultModal = document.getElementById('result-modal');
    this.previewSnapshotImg = document.getElementById('preview-snapshot-img');
    this.adjustDrawer = document.getElementById('adjust-drawer');
    this.debugBtn = document.getElementById('debug-toggle-btn');
    this.cameraBtn = document.getElementById('camera-toggle-btn');
    this.layerBtn = document.getElementById('layer-toggle-btn');
  }

  async init() {
    await this.engine.initialize();
    this.setupEventListeners();
    this.renderCategoryTabs();
    this.renderCarousel();
    this.selectProduct(0);
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Start video pipeline (defaults to high-fidelity simulated model, toggleable to real camera)
    this.startRenderLoop();
  }

  setupEventListeners() {
    // Camera / Synthetic Toggle
    this.cameraBtn.addEventListener('click', () => this.toggleCameraSource());

    // Debug Overlay Toggle
    this.debugBtn.addEventListener('click', () => {
      const isShowing = !this.debugBtn.classList.contains('active');
      this.debugBtn.classList.toggle('active', isShowing);
      this.engine.updateDebugOptions({
        showLandmarks: isShowing,
        showAnchors: isShowing,
        showBoundingBoxes: isShowing,
        showFps: true
      });
    });

    // Layering Toggle (e.g. Combine Sunglasses with Garment)
    this.layerBtn.addEventListener('click', () => {
      this.layerEyewear = !this.layerEyewear;
      this.layerBtn.classList.toggle('active', this.layerEyewear);
      this.updateActiveProducts();
    });

    // Capture Button Click
    document.getElementById('capture-btn').addEventListener('click', () => this.triggerCaptureFlow());

    // Modal Actions
    document.getElementById('modal-close-btn').addEventListener('click', () => {
      this.resultModal.classList.remove('open');
    });

    document.getElementById('download-look-btn').addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = `kiosk-tryon-look-${Date.now()}.png`;
      link.href = this.previewSnapshotImg.src;
      link.click();
    });

    // Fit Adjustments Drawer
    document.getElementById('adjust-btn').addEventListener('click', () => {
      this.adjustDrawer.classList.toggle('open');
    });
    document.getElementById('close-adjust-btn').addEventListener('click', () => {
      this.adjustDrawer.classList.remove('open');
    });

    // Adjustment sliders
    ['scale', 'offset-x', 'offset-y', 'rotation'].forEach(type => {
      const slider = document.getElementById(`slider-${type}`);
      const valLabel = document.getElementById(`val-${type}`);
      slider.addEventListener('input', () => {
        valLabel.textContent = slider.value + (type === 'scale' ? 'x' : (type === 'rotation' ? '°' : ''));
        this.applyAdjustment(type, parseFloat(slider.value));
      });
    });

    document.getElementById('reset-adjust-btn').addEventListener('click', () => {
      this.resetAdjustments();
    });
  }

  resizeCanvas() {
    const rect = this.canvasEl.getBoundingClientRect();
    this.canvasEl.width = rect.width;
    this.canvasEl.height = rect.height;
  }

  renderCategoryTabs() {
    const tabs = [
      { id: 'all', label: 'ALL' },
      { id: 'outerwear', label: 'OUTERWEAR' },
      { id: 'tops', label: 'TOPS' },
      { id: 'dresses', label: 'DRESSES' },
      { id: 'eyewear', label: 'EYEWEAR' }
    ];

    const container = document.getElementById('category-tabs');
    container.innerHTML = '';
    tabs.forEach(tab => {
      const btn = document.createElement('button');
      btn.className = `tab-btn ${this.activeCategory === tab.id ? 'active' : ''}`;
      btn.textContent = tab.label;
      btn.onclick = () => {
        this.activeCategory = tab.id;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderCarousel();
        this.selectProduct(0);
      };
      container.appendChild(btn);
    });
  }

  getFilteredCatalog() {
    if (this.activeCategory === 'all') return CATALOG;
    return CATALOG.filter(p => p.category === this.activeCategory);
  }

  renderCarousel() {
    const items = this.getFilteredCatalog();
    this.carouselTrack.innerHTML = '';

    items.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `carousel-card ${index === this.selectedProductIndex ? 'active' : ''}`;
      card.onclick = () => this.selectProduct(index);

      const img = document.createElement('img');
      img.src = item.cutoutUrl;
      img.alt = item.name;
      card.appendChild(img);

      this.carouselTrack.appendChild(card);
    });
  }

  selectProduct(index) {
    const items = this.getFilteredCatalog();
    if (index < 0 || index >= items.length) return;
    this.selectedProductIndex = index;
    const current = items[index];

    // Update active card styling
    const cards = this.carouselTrack.querySelectorAll('.carousel-card');
    cards.forEach((card, idx) => {
      card.classList.toggle('active', idx === index);
    });

    // Update text banner
    this.productNameEl.textContent = current.name;
    this.categoryLabelEl.textContent = current.categoryLabel;
    this.productPriceEl.textContent = current.price;

    // Reset or render variants
    this.selectedVariantHex = null;
    this.renderVariants(current);

    this.updateActiveProducts();
  }

  renderVariants(product) {
    this.variantsRow.innerHTML = '';
    if (!product.colors || product.colors.length <= 1) return;

    product.colors.forEach((col, idx) => {
      const dot = document.createElement('div');
      dot.className = `variant-dot ${idx === 0 ? 'active' : ''}`;
      dot.style.backgroundColor = col.hex;
      dot.title = col.name;
      dot.onclick = () => {
        this.variantsRow.querySelectorAll('.variant-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        this.selectedVariantHex = col.hex;
        this.updateActiveProducts();
      };
      this.variantsRow.appendChild(dot);
    });
  }

  async updateActiveProducts() {
    const items = this.getFilteredCatalog();
    const primary = items[this.selectedProductIndex];
    if (!primary) return;

    const productsToRender = [primary];

    // If layering is enabled and primary isn't eyewear, add sunglasses
    if (this.layerEyewear && primary.category !== 'eyewear') {
      const sunglasses = CATALOG.find(p => p.category === 'eyewear');
      if (sunglasses) productsToRender.push(sunglasses);
    }

    await this.engine.setActiveProducts(productsToRender);

    // Apply color tint if selected
    if (this.selectedVariantHex) {
      this.engine.setAdjustment(primary.id, { colorVariantHex: this.selectedVariantHex });
    }
  }

  applyAdjustment(type, value) {
    const items = this.getFilteredCatalog();
    const current = items[this.selectedProductIndex];
    if (!current) return;

    const map = {
      'scale': { scale: value },
      'offset-x': { offsetX: value },
      'offset-y': { offsetY: value },
      'rotation': { rotationNudge: value }
    };
    this.engine.setAdjustment(current.id, map[type]);
  }

  resetAdjustments() {
    const items = this.getFilteredCatalog();
    const current = items[this.selectedProductIndex];
    if (current) {
      this.engine.resetAdjustments(current.id);
    }
    document.getElementById('slider-scale').value = '1.0';
    document.getElementById('val-scale').textContent = '1.0x';
    document.getElementById('slider-offset-x').value = '0';
    document.getElementById('val-offset-x').textContent = '0';
    document.getElementById('slider-offset-y').value = '0';
    document.getElementById('val-offset-y').textContent = '0';
    document.getElementById('slider-rotation').value = '0';
    document.getElementById('val-rotation').textContent = '0°';
  }

  async toggleCameraSource() {
    if (!this.useWebcam) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1920 } }
        });
        this.videoEl.srcObject = stream;
        await this.videoEl.play();
        this.videoStream = stream;
        this.useWebcam = true;
        this.cameraBtn.classList.add('active');
        this.cameraBtn.title = 'Switch to Simulated Model';
      } catch (err) {
        console.warn('Webcam permission not granted or device not available; falling back to simulated model.', err);
        alert('Webcam access was not granted or not available. Continuing with high-precision simulated human model.');
      }
    } else {
      if (this.videoStream) {
        this.videoStream.getTracks().forEach(t => t.stop());
        this.videoEl.srcObject = null;
      }
      this.useWebcam = false;
      this.cameraBtn.classList.remove('active');
      this.cameraBtn.title = 'Switch to Live Webcam';
    }
  }

  /**
   * Generates smooth, realistic simulated human landmarks (33 pose + face points)
   * simulating natural breathing, head movement, and shoulder shift at 60 FPS.
   */
  generateSimulatedDetection(t) {
    const sway = Math.sin(t * 0.0018) * 0.025;
    const breathe = Math.sin(t * 0.003) * 0.008;
    const headTilt = Math.sin(t * 0.0012) * 0.015;

    // Normalized coordinates [0..1]
    const centerX = 0.50 + sway;
    const neckY = 0.28 + breathe;
    const shoulderSpan = 0.28;

    const leftShoulder = { x: centerX - shoulderSpan / 2, y: neckY + 0.05, z: 0, visibility: 0.99 };
    const rightShoulder = { x: centerX + shoulderSpan / 2, y: neckY + 0.05, z: 0, visibility: 0.99 };
    const leftHip = { x: centerX - 0.12, y: neckY + 0.42, z: 0, visibility: 0.98 };
    const rightHip = { x: centerX + 0.12, y: neckY + 0.42, z: 0, visibility: 0.98 };

    // Pose Landmarks (33 points)
    const poseLandmarks = new Array(33).fill(null).map((_, i) => ({ x: centerX, y: neckY, z: 0, visibility: 0.9 }));
    poseLandmarks[0] = { x: centerX + headTilt, y: neckY - 0.12, z: 0, visibility: 0.99 }; // Nose
    poseLandmarks[2] = { x: centerX - 0.04 + headTilt, y: neckY - 0.14, z: 0, visibility: 0.99 }; // Left Eye
    poseLandmarks[5] = { x: centerX + 0.04 + headTilt, y: neckY - 0.14, z: 0, visibility: 0.99 }; // Right Eye
    poseLandmarks[11] = leftShoulder;
    poseLandmarks[12] = rightShoulder;
    poseLandmarks[23] = leftHip;
    poseLandmarks[24] = rightHip;

    // Face Landmarks (468 points minimal mapping)
    const faceLandmarks = new Array(468).fill(null).map((_, i) => ({ x: centerX, y: neckY - 0.12, z: 0, visibility: 0.9 }));
    faceLandmarks[33] = { x: centerX - 0.055 + headTilt, y: neckY - 0.14, z: 0, visibility: 0.99 }; // Left eye outer
    faceLandmarks[263] = { x: centerX + 0.055 + headTilt, y: neckY - 0.14, z: 0, visibility: 0.99 }; // Right eye outer
    faceLandmarks[168] = { x: centerX + headTilt, y: neckY - 0.13, z: 0, visibility: 0.99 }; // Nose bridge

    return {
      poseLandmarks,
      faceLandmarks,
      confidence: 0.98,
      timestampMs: t
    };
  }

  drawSimulatedBackground(ctx, w, h, t) {
    // Luxury boutique mirror backdrop
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#12141c');
    grad.addColorStop(0.5, '#1e2230');
    grad.addColorStop(1, '#0c0d12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Warm ambient retail spotlight
    const spot = ctx.createRadialGradient(w / 2, h * 0.35, 20, w / 2, h * 0.35, w * 0.8);
    spot.addColorStop(0, 'rgba(212, 175, 55, 0.14)');
    spot.addColorStop(0.6, 'rgba(99, 102, 241, 0.05)');
    spot.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spot;
    ctx.fillRect(0, 0, w, h);

    // Silhouette mannequin figure
    const sway = Math.sin(t * 0.0018) * (w * 0.025);
    const breathe = Math.sin(t * 0.003) * (h * 0.008);
    const cx = w * 0.5 + sway;
    const cy = h * 0.33 + breathe;

    ctx.fillStyle = 'rgba(28, 32, 44, 0.9)';
    // Head & Neck
    ctx.beginPath();
    ctx.ellipse(cx, cy - 90, 52, 68, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.rect(cx - 18, cy - 35, 36, 45);
    ctx.fill();

    // Shoulders & Torso
    ctx.beginPath();
    ctx.moveTo(cx - 150, cy + 30);
    ctx.quadraticCurveTo(cx, cy - 10, cx + 150, cy + 30);
    ctx.lineTo(cx + 105, cy + 380);
    ctx.lineTo(cx - 105, cy + 380);
    ctx.closePath();
    ctx.fill();
  }

  startRenderLoop() {
    const loop = (timestamp) => {
      this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);

      if (!this.useWebcam) {
        this.drawSimulatedBackground(this.ctx, this.canvasEl.width, this.canvasEl.height, timestamp);
      }

      const detection = this.generateSimulatedDetection(timestamp);

      const renderContext = {
        canvas: this.canvasEl,
        ctx: this.ctx,
        videoSource: this.useWebcam ? this.videoEl : undefined,
        width: this.canvasEl.width,
        height: this.canvasEl.height,
        timestamp
      };

      this.engine.renderFrame(renderContext, detection);

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  triggerCaptureFlow() {
    this.countdownOverlay.style.display = 'flex';
    let count = 3;
    this.countdownNumber.textContent = count;

    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        this.countdownNumber.textContent = count;
      } else {
        clearInterval(timer);
        this.countdownOverlay.style.display = 'none';

        // Trigger Flash
        this.flashOverlay.classList.add('flashing');
        setTimeout(() => this.flashOverlay.classList.remove('flashing'), 400);

        // Capture snapshot
        this.captureSnapshot();
      }
    }, 900);
  }

  captureSnapshot() {
    // Generate snapshot by combining video frame and try-on canvas
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = this.canvasEl.width;
    snapCanvas.height = this.canvasEl.height;
    const sCtx = snapCanvas.getContext('2d');

    if (this.useWebcam && this.videoEl.readyState >= 2) {
      sCtx.save();
      sCtx.translate(snapCanvas.width, 0);
      sCtx.scale(-1, 1); // un-mirror
      sCtx.drawImage(this.videoEl, 0, 0, snapCanvas.width, snapCanvas.height);
      sCtx.restore();
    } else {
      // Draw simulated backdrop
      this.drawSimulatedBackground(sCtx, snapCanvas.width, snapCanvas.height, performance.now());
    }

    // Draw active tryon layer
    sCtx.drawImage(this.canvasEl, 0, 0);

    // Add luxury watermark
    sCtx.font = '600 14px "Cormorant Garamond", serif';
    sCtx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    sCtx.fillText('AI VIRTUAL TRY-ON KIOSK', 24, snapCanvas.height - 24);

    const dataUrl = snapCanvas.toDataURL('image/png');
    this.previewSnapshotImg.src = dataUrl;
    this.resultModal.classList.add('open');
  }
}

// Boot application
window.addEventListener('DOMContentLoaded', () => {
  const app = new KioskDemoApp();
  app.init();
});
