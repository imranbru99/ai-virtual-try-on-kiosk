# AI virtual try-on kiosk

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Laravel](https://img.shields.io/badge/Laravel-12.x-red.svg)](https://laravel.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Tasks%20Vision-00C49F.svg)](https://developers.google.com/mediapipe)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL%2FWebGPU-black.svg)](https://threejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)

> **AI-powered virtual try-on kiosk for retail stores, malls and exhibitions. Also deployable as a website, e-commerce widget or mobile app.**

`ai-virtual-try-on-kiosk` is a production-ready, open-source, multi-tenant virtual try-on platform. Built from the ground up to give shoppers instant, zero-latency visual feedback on live camera feeds and high-definition generative AI try-on renders, all managed through a centralized fleet and catalog admin.

---

## 📑 Table of Contents

1. [Product Goal & Categories](#1-product-goal--supported-categories)
2. [Four Deployment Modes](#2-four-deployment-modes)
3. [Kiosk User Experience](#3-kiosk-user-experience)
4. [Try-On Engine (`packages/engine`)](#4-try-on-engine-packagesengine)
5. [Admin Panel & Fleet Operations (Filament v4)](#5-admin-panel--fleet-operations-filament-v4)
6. [Public & Internal REST / WebSocket API](#6-public--internal-rest--websocket-api)
7. [E-Commerce Integrations](#7-e-commerce-integrations)
8. [Native Mobile App](#8-native-mobile-app)
9. [AI Features Beyond Try-On](#9-ai-features-beyond-try-on)
10. [Hardware & Kiosk Mode Specifications](#10-hardware--kiosk-mode-specifications)
11. [Privacy, Security & Compliance](#11-privacy-security--compliance)
12. [Performance & Reliability](#12-performance--reliability)
13. [Design System & Accessibility](#13-design-system--accessibility)
14. [Internationalization (i18n)](#14-internationalization-i18n)
15. [System Architecture Diagram](#15-system-architecture-diagram)
16. [Monorepo Directory Layout](#16-monorepo-directory-layout)
17. [Quick Start & Verification](#17-quick-start--verification)
18. [Contact & Collaboration](#-lets-build-something-exceptional)

---

## 1. Product Goal & Supported Categories

Customers see how products look on them, live and without physically trying them on. The platform handles a comprehensive matrix of retail fashion items:

| Category Family | Sub-Categories Supported | Fitting Strategy |
| :--- | :--- | :--- |
| **Clothing** | Tops (shirts, t-shirts, blouses, polos), Outerwear (jackets, blazers, coats, hoodies), Dresses & Gowns, Bottoms (jeans, trousers, skirts), Traditional wear (sarees, kurtas, abayas, panjabis, thobes) | 2D affine/perspective warp + cloth drape mesh + Generative HD |
| **Eyewear** | Sunglasses, Optical frames, Aviators, Wayfarers, Oversized glasses | IPD-scaled 2D warp + 3D Three.js PBR models |
| **Headwear** | Hats, Fedoras, Beanies, Baseball caps, Berets | Forehead line & head circumference tracking |
| **Jewelry** | Necklaces, Pendants, Chokers, Earrings, Rings, Bracelets | Neck, earlobe, wrist, and finger anchor maps |
| **Watches** | Luxury watches, Sport watches, Smartwatch straps | Wrist landmark orientation & radial band alignment |
| **Bags & Scarves**| Crossbody bags, Shoulder totes, Clutches, Silk scarves, Winter scarves | Shoulder hang anchors & neck drape simulation |
| **Footwear** | Sneakers, Boots, Loafers, Heels, Sandals | Ankle/heel/toe tracking + floor plane projection |
| **Cosmetics** | Lipstick (matte, gloss, satin), Blush, Contouring | MediaPipe face mesh lip/cheek blending shaders |
| **Hair Color** | Natural shades, Vibrant tints, Balayage highlights | Hair segmentation mask with HSV recoloring |

---

## 2. Four Deployment Modes

Run four distinct channels from a single unified codebase:

1. **In-Store Touch Kiosk**: Fullscreen portrait live touch device for retail flagships, department stores, malls, and pop-up exhibitions.
2. **Brand Flagship Website**: Custom domain web experience with webcam try-on and static photo upload.
3. **E-Commerce Embed**: Sub-100KB framework-free vanilla TypeScript bundle (`tryon-widget.js`), iframe fallback, plus official Shopify App and WooCommerce plugins.
4. **Native Mobile App**: Cross-platform iOS and Android application built on Expo React Native sharing the TypeScript try-on engine package.

---

## 3. Kiosk User Experience

### 3.1 Attract & Idle Screen
- **Looping Brand Video / Animated Lookbook**: 4K/1080p looped video or high-fashion lookbook carousel showing "Touch to try on".
- **Motion & Person Detection Wakeup**: PIR motion sensor or computer vision presence detection automatically wakes the kiosk from standby with a personalized welcome greeting.
- **Wave to Start**: Optional touch-free gesture to wake the kiosk from up to 2 meters away.
- **Multi-Language Switcher**: Instant switching between English, Bengali, Arabic, Hindi, and more with full Right-to-Left (RTL) layout switching.

### 3.2 Onboarding
- **Privacy & Consent Screen**: Clear, transparent consent for camera usage, ephemeral photo processing, and optional marketing opt-in.
- **Dynamic Position Guide**: Interactive silhouette outline driven by live pose landmarks that actively guides the customer ("Step back", "Move closer", "Center yourself").
- **Profile Selector**: Optional demographic and style preference filter (Men, Women, Unisex, Kids, Formal, Casual) to curate the displayed catalog.

### 3.3 Live Try-On Experience
- **Guaranteed Fluid 30+ FPS**: Client-side execution on kiosk hardware with adaptive quality scaling.
- **Sub-100ms Product Switching**: Preloaded in-memory textures and assets for instantaneous carousel transitions.
- **Category Tabs**: Horizontal scrollable tabs (Tops, Outerwear, Dresses, Eyewear, Footwear, Jewelry, Accessories).
- **Size & Color Variant Selectors**: Real-time color re-rendering and tinting without re-fetching assets.
- **Fit Adjustments**: Interactive controls for scale (0.8x to 1.3x), horizontal/vertical nudge, rotation angle, and one-tap "Auto-fit".
- **Multi-Item Layering**: "Complete the Look" stack combining multiple products simultaneously (e.g. blazer over cashmere sweater + sunglasses + necklace).
- **Compare Mode**: Split-screen side-by-side comparison between two items or the previous try-on vs current look.
- **Touch-Free Gesture Control**: Air swipe to browse items, pinch or open-palm gesture to trigger capture, thumbs-up to favorite.
- **Voice Commands**: Multilingual voice recognition for "next", "take photo", "add to cart", and language switching.
- **Virtual Background Replacement & Blur**: Real-time selfie segmentation replacing store background with luxury studio, Parisian street, or red carpet backdrops.
- **Lighting Normalization**: Auto-exposure and white balance normalization matching ambient store illumination.
- **Multi-Person Mode**: Simultaneous multi-person tracking and garment try-on for 2 to 4 people.
- **Display Flexibility**: One-touch mirror mode toggle and screen rotation support (portrait 1080×1920 or landscape 1920×1080).

### 3.4 Capture & Result
- **3-2-1 Countdown & Studio Flash**: High-visibility animated countdown with sound prompt and full-screen studio flash effect.
- **Capture Modes**: Instant snapshot, 3-frame burst mode, and short animated video/GIF (Boomerang).
- **Dual Output Renders**:
  - **Instant Capture**: Immediate local overlay snapshot in full camera resolution.
  - **HD AI Try-On**: Server-side photorealistic generative render (3 to 10 seconds) with progress animation and Reverb WebSocket updates.
- **Result Actions**: Retake, Try Another, Save Look, Add to Cart, Buy Now, Share.
- **QR Code Phone Transfer**: Instant cross-device transfer to customer's smartphone via short-lived signed URL.
- **Omnichannel Sharing**: Direct sharing to WhatsApp, Email, SMS, or camera roll download.
- **Branded Social Templates**: Customizable 9:16 Instagram Story frames, brand watermarks, and promotional badges.
- **Print-on-Site**: Direct integration with in-store thermal receipt printers or dye-sub photo printers (DNP/Epson).

### 3.5 Commerce & Staff Assistance
- **Product Detail Sheet**: Live pricing, material composition, care instructions, and local store stock availability.
- **"Ask Staff" Tablet Alert**: Notifies store floor staff on dedicated tablets ("Customer at Kiosk 3 requested Size M of Noir Silk Blazer").
- **Cart Handoff**: Scan QR code to transfer items and sizes directly to the retailer's online e-commerce checkout.
- **On-Kiosk Payments**: Pluggable payment drivers for Stripe Terminal, SSLCommerz, bKash, and Nagad.
- **Recommendation Engine**: Rule-based and AI recommendations ("Similar Styles", "Goes Well With", "Trending in this Store").
- **Pose-Driven Size Estimation**: Suggests ideal garment size (S/M/L/XL) from estimated body landmark proportions with confidence score.

### 3.6 Gamification & Engagement
- **Spin-to-Win / Coupon Reveal**: Interactive gamified reward revealed after try-on sessions, generating unique barcodes/promocodes redeemable at store POS.
- **"Vote on My Look"**: Shareable social poll links for friends to vote on looks.
- **Trending Leaderboards**: Live display of the store's most frequently tried-on items.
- **Customer Loyalty**: Optional phone/email recognition to retrieve saved looks and preferences across store visits.

### 3.7 Accessibility
- Large touch-target UI elements designed for capacitive glass.
- High-contrast accessibility mode and adjustable text sizing.
- ARIA screen-reader labels and audible voice guidance.
- **One-Hand-Reach / Wheelchair Layout**: One-tap toggle that shifts all controls and carousel to the lower 40% of the display.

---

## 4. Try-On Engine (`packages/engine`)

The engine is framework-agnostic TypeScript with a unified `TryOnEngine` interface and three pluggable strategies:

### 4.1 Realtime 2D Warp Engine
- **Landmark-Driven Scaling & Affine Transform**: Torso, shoulder, chest, and hip geometry calculations for instant garment positioning.
- **One-Euro Filter (`OneEuroFilter`)**: Adaptive cutoff frequency smoothing (Casiez et al. CHI 2012) eliminating landmark jitter while preserving zero lag during fast motion.
- **Occlusion Handling**: Integrates MediaPipe Selfie Segmentation masks so arms, hands, and hair render naturally on top of garments.
- **Mesh Drape Warping**: Barycentric coordinate triangle deformation approximating cloth drape around the waist and sleeves.

### 4.2 Realtime 3D Engine
- **Three.js PBR Pipeline**: Renders glTF/GLB models for eyewear, hats, jewelry, and footwear.
- **Perspective-n-Point (PnP) Pose Tracking**: Head-pose rotation and translation matrices for 3D accessory stability.
- **Environment Light Estimation**: Samples ambient camera frame brightness and color temperature to adjust 3D metallic and roughness shaders.

### 4.3 Generative HD Engine (Server-Side)
- **Pluggable AI Driver Architecture**:
  - Google Gemini Vision Driver (`gemini-2.5-flash` / `gemini-2.5-pro`)
  - OpenAI Image Edit Driver (`dall-e` / `image-edit`)
  - Self-Hosted Diffusion Pipeline (IDM-VTON / OOTDiffusion behind Redis queues)
- **Body-Parse Preprocessing**: Automatic pose extraction, garment masking, and face preservation.
- **Safety Filters**: Mandatory NSFW classification, minor protection policies, and non-biometric template storage.
- **Result Caching**: Fast cache lookup keyed by `(person_feature_hash, product_sku)`.
- **Cost Tracking**: Automated token, GPU latency, and credit metering per render job.

### 4.4 Automated Asset Ingestion Pipeline
- Automated background removal for transparent product cutouts.
- Automatic category detection based on aspect ratios, edge profiles, and metadata.
- Automatic anchor point suggestion (shoulders, chest, waist, eye temples, nose bridge).
- Automated thumbnail, mipmap, and texture compression (WebP / AVIF).

---

## 5. Admin Panel & Fleet Operations (Filament v4)

Built with Laravel 12 and Filament v4 with strict multi-tenant isolation (**Organization -> Brand -> Store -> Kiosk**):

- **Brand Customization**:
  - Custom domains, logos, favicons, and localized legal disclaimers.
  - Luxury theme engine: CSS token overrides (Cormorant, Playfair, Inter fonts; accent palettes; corner radii).
  - Idle screen video uploads and campaign lookbook scheduling.
- **Product & Catalog Management**:
  - Full catalog: categories, products, SKUs, prices, currencies, tags, genders, and seasons.
  - Variants: size, color name, hex code, and localized inventory counts.
  - Asset manager: PNG cutouts, 3D glTF models, anchor maps, and normal maps.
  - Bulk CSV/Excel import/export and 2-way sync with Shopify & WooCommerce.
- **Kiosk Fleet Management**:
  - **Pairing Handshake**: Register any new kiosk hardware in seconds via a 6-digit one-time pairing code.
  - **Remote Fleet Commands**: Restart application, reboot machine, purge cache, capture screenshot, lock screen, enter maintenance mode.
  - **Real-Time Telemetry**: Live dashboard showing online status, FPS, CPU/RAM/GPU usage, temperature, camera health, and network latency.
  - **OTA Updates**: Over-The-Air web app updates with staged canary rollouts and instant rollback.
  - **Automated Fleet Alerts**: Push notifications to Email, Telegram, or WhatsApp when a kiosk goes offline or drops below target FPS.
- **Content & Drop Scheduling**:
  - Dayparting: schedule different idle videos and featured products by time of day and day of week.
  - Limited-edition collection drops with automatic start/end publishing dates.
- **Campaigns & Coupons**:
  - Spin-to-win campaign builder with unique coupon generation, expiration limits, and POS redemption verification API.
- **Analytics & BI Dashboard**:
  - Try-on volume per product, category, kiosk, and store.
  - Funnel metrics: Sessions -> Try-Ons -> Captures -> QR Scans -> Staff Inquiries -> Add-to-Carts.
  - Heatmaps by hour and day of week; most popular layered combinations; abandoned looks.
  - Anonymous, consented demographic bucket analytics (estimated age bracket, style preference).
  - Automated PDF/CSV export and scheduled email reports.
- **Lead Capture & CRM**:
  - Consented customer emails and mobile numbers captured via QR handoff.
  - Real-time webhook dispatching to Mailchimp, HubSpot, Zoho, and WhatsApp Business.
- **In-Store Staff Tablet View**:
  - Real-time queue of customer assistance requests from kiosks, complete with kiosk name, product thumbnail, and requested size.
- **Role-Based Access Control (Spatie Permissions)**:
  - Super Admin, Organization Owner, Brand Manager, Store Manager, Staff Floor Assistant, and Analyst roles.
  - Full audit logging, Two-Factor Authentication (2FA), and session tracking.
- **Billing & SaaS Subscriptions**:
  - Tiered subscription management, per-kiosk monthly billing, and per-render AI credit metering via Stripe or SSLCommerz.

---

## 6. Public & Internal REST / WebSocket API

- **REST API v1**: Complete OpenAPI 3.0 specification with Sanctum bearer auth, `X-Kiosk-Key` fleet authentication, and `X-Brand-Key` public tokens.
- **Idempotency & Rate Limiting**: Token-bucket rate limiting and idempotency keys on render jobs and captures.
- **Realtime WebSockets (Laravel Reverb)**:
  - `private-kiosk.{kiosk_id}`: Remote control commands and catalog push notifications.
  - `private-session.{session_id}`: Live render progress updates (Queued -> Inpainting -> Upscaling -> Ready).
  - `private-store.{store_id}.staff`: Instant floor staff alerts.
- **Signed HMAC Webhooks**:
  - `render.completed`: Dispatched when an HD diffusion render finishes.
  - `look.shared`: Triggered when a look is scanned or shared.
  - `coupon.redeemed`: Dispatched on POS barcode scan.
  - `lead.created`: Triggered when an in-store shopper opts into marketing.
  - `kiosk.offline`: Sent when a kiosk misses consecutive heartbeats.

---

## 7. E-Commerce Integrations

- **Embeddable Widget**: 3-line `<script>` tag adding a "Try It On" button to existing e-commerce PDPs (Product Detail Pages).
- **Photo-Upload Fallback**: Desktop shoppers without webcams can upload photos for instant 2D try-on or HD generative rendering.
- **Shopify App**: Official Shopify Theme App Extension (Theme Block) with automated catalog sync and billing integration.
- **WooCommerce Plugin**: Native WordPress plugin with Gutenberg blocks, shortcodes, and cutout meta fields.
- **Headless SDK**: `npm i @ai-virtual-try-on-kiosk/widget` for custom React, Next.js, Vue, or Nuxt headless frontends.
- **PostMessage Callbacks**: Seamlessly hands cart additions and variant selections back to the host store's native cart.

---

## 8. Native Mobile App

- Built with Expo React Native sharing the core `@ai-tryon/engine` TypeScript package.
- Direct hardware camera integration with native WebGL/WASM acceleration.
- Offline catalog storage with background synchronization.
- Deep-linking from kiosk QR codes allowing shoppers to view and edit looks on their personal phones.
- Native push notifications for wishlist restocks and promotional drops.
- Biometric authentication (Face ID / Touch ID) for saved looks.
- ARKit (iOS) and ARCore (Android) integration for footwear and eyewear tracking.

---

## 9. AI Features Beyond Try-On

- **Conversational AI Stylist**: LLM stylist chatbot ("What should I wear to a formal evening gala?") that recommends catalog products and directly triggers try-on.
- **Skin-Tone & Fit Recommendations**: Non-discriminatory, opt-in color palette matching suggesting complementary fabric shades.
- **Automated Multilingual Copywriting**: Generates localized, SEO-rich product descriptions in English, Bengali, Arabic, and Hindi.
- **Computer Vision Auto-Tagging**: Automatically labels uploaded products with color, pattern, silhouette, occasion, and seasonal tags.
- **Smart Size Confidence**: Estimates body dimensions from pose landmarks and provides a confidence percentage for each size.
- **Trend Intelligence Reports**: Weekly AI-generated summaries of what in-store shoppers tried on, saved, and purchased.
- **Automated Content Moderation**: Real-time NSFW and unsafe-image filtering on both customer uploads and AI render outputs.

---

## 10. Hardware & Kiosk Mode Specifications

| Subsystem | Commercial Recommendation |
| :--- | :--- |
| **Enclosure & Screen** | 43" to 55" Portrait Commercial Touchscreen (1080×1920 or 4K UHD), 500+ nits brightness, anti-glare capacitive touch |
| **Compute Node** | Intel Core i5/i7 (12th gen+) or AMD Ryzen 7 Mini-PC, 16GB DDR5 RAM, NVMe SSD, Intel Iris Xe / RTX 3050 GPU |
| **Camera** | 1080p 60 FPS USB 3.0 wide-angle camera (or Intel RealSense D435 / Orbbec depth camera) |
| **Lighting** | Perimeter diffused LED ring light / halo strip (4000K-5000K neutral daylight) |
| **Wake Sensor** | 24 GHz microwave radar or PIR motion sensor for touchless wake-from-sleep |
| **Audio** | Directional stereo soundbar or ultrasonic directional speakers |
| **Printers (Optional)**| DNP DS-RX1HS Dye-Sublimation Photo Printer or Epson TM-T88VI Thermal Receipt Printer |
| **Barcode / NFC** | In-counter 2D QR / NFC barcode reader |

### Chromium Kiosk Mode Scripts
- Automated system boot directly into full-screen Chromium kiosk mode (`--kiosk --incognito --disable-pinch --overscroll-history-navigation=0`).
- Process watchdog script automatically restarting the app if an unhandled crash or memory leak occurs.
- Operating system lock-down disabling Windows/Linux shortcuts (Alt+Tab, Ctrl+Alt+Del, Windows Key, gesture swipes).
- Scheduled display sleep/wake timers matching retail mall operating hours.

---

## 11. Privacy, Security & Compliance

- **Edge Processing First**: 100% of live camera streams are processed locally on the kiosk's GPU/memory. Raw video feeds are **never** streamed to the server.
- **Zero Face Biometric Storage**: Face landmarks are converted to relative spatial coordinates and discarded frame-by-frame; no biometric facial recognition templates are created or stored.
- **Ephemeral Storage & Retention Lifecycle**: Uploaded capture snapshots are stored in private, encrypted S3 buckets with automatic TTL deletion (default 2 hours for anonymous kiosk sessions).
- **Right to Be Forgotten**: Immediate, one-tap "Delete My Photos" button on the customer's QR mobile landing page.
- **Minor Protection Policy**: Automated detection to blur or immediately discard captures of minors unless explicit parental consent is configured.
- **Enterprise Security**: Signed expiring URLs, tenant DB isolation, strict Content Security Policy (CSP), CORS allowlists, and full Spatie audit trails.
- **GDPR & CCPA Compliant**: Dedicated data export and hard-deletion endpoints.

---

## 12. Performance & Reliability

- **Frame Budget Management**: Active FPS monitoring maintaining a smooth 30–60 FPS. If performance dips below 24 FPS, the engine automatically scales segmentation resolution and swaps 3D shaders to 2D affine warping.
- **Asset Preloading**: Background downloading and caching of next-carousel cutouts guarantee sub-100ms item switching.
- **High-Concurrency Generative Queues**: Redis and Laravel Horizon worker pools load-tested with k6 targeting 100+ concurrent generative diffusion jobs.
- **Resilient Fallback**: If an upstream AI provider experiences an outage, the kiosk gracefully falls back to instant local capture overlays with zero downtime.
- **Structured Observability**: Integrated Sentry error reporting, Prometheus metrics, and automated database backups.

---

## 13. Design System & Accessibility

- **Luxury Minimal Aesthetic**: High-end fashion editorial styling with serif typography (*Cormorant Garamond* / *Playfair Display*), clean functional sans-serif (*Inter*), translucent glassmorphism panels, and smooth spring micro-animations.
- **Multi-Form Factor Layouts**:
  - Fullscreen Portrait Kiosk (1080×1920)
  - Fullscreen Landscape Kiosk (1920×1080)
  - Responsive Tablet & Mobile Viewports
- **Accessibility Tokens**: High-contrast mode, WCAG 2.1 AA color contrast compliance, and full keyboard/screen-reader navigation.

---

## 14. Internationalization (i18n)

- Multi-language support out of the box: **English**, **Bengali (বাংলা)**, **Arabic (العربية)**, and **Hindi (हिन्दी)**.
- Full Right-to-Left (RTL) mirror support for Arabic layouts.
- Localized currencies ($ USD, € EUR, £ GBP, ৳ BDT, ₹ INR, د.إ AED, etc.) and date/time formatting.
- Translatable admin interface and localized catalog fields.

---

## 15. System Architecture Diagram

```
+------------------------------------------------------------------------------------------------------------+
|                                              EDGE & CLIENT TIERS                                           |
+------------------------------------------------------------------------------------------------------------+
|  [In-Store Touch Kiosk]        [Brand Website]        [E-Commerce Widget]         [Expo Mobile App]        |
|  - Fullscreen Next.js PWA      - Next.js Web App      - <100KB Vanilla TS Script  - React Native (iOS/And) |
|  - 1080x1920 Portrait Touch    - Camera & Upload      - Shopify / WooCommerce     - ARKit / ARCore         |
+------------------------------------------------------------------------------------------------------------+
                                                       |
                                           Real-Time Vision Stream
                                     (Pose, Face, Hand, Segmentation)
                                                       |
                                                       v
+------------------------------------------------------------------------------------------------------------+
|                                    packages/engine (TryOnEngine Core)                                      |
+------------------------------------------------------------------------------------------------------------+
|  Strategy 1: Realtime 2D Warp Engine (One-Euro Filter, Multi-Anchor Maps, Mesh Drape, Occlusion Mask)      |
|  Strategy 2: Realtime 3D Engine (Three.js PBR, Head/Foot PnP Tracking, Environment Light Estimation)       |
|  Strategy 3: Generative HD Client (Snapshot Capture, Ephemeral S3 Signed URL, Reverb WS Progress Monitor) |
|  Diagnostics: BenchmarkSuite (Rolling FPS, Latency, Jitter Score) + DebugOverlay (Skeleton & Keypoints)    |
+------------------------------------------------------------------------------------------------------------+
                                                       |
                                            HTTPS / REST v1 / WSS
                                                       |
                                                       v
+------------------------------------------------------------------------------------------------------------+
|                                         BACKEND CLOUD INFRASTRUCTURE                                       |
+------------------------------------------------------------------------------------------------------------+
|  Laravel 12 REST API + Sanctum + Spatie Multitenancy (Org -> Brand -> Store -> Kiosk)                     |
|  Filament v4 Admin Panel (Brand Theme, Fleet Remote Control, Catalog Sync, Analytics BI, Staff Queue)      |
|                                                                                                            |
|  Queues & Realtime (Redis 7.2 + Laravel Horizon + Laravel Reverb WebSockets):                             |
|  - queue: high (Fleet Heartbeats, Staff Tablet Alerts, Pairing Handshake)                                  |
|  - queue: default (Analytics Events, Coupon Validation, Lead Sync)                                        |
|  - queue: ai-renders (Asynchronous Photorealistic Generative Diffusion Jobs)                              |
|                                                                                                            |
|  Pluggable Generative AI Drivers:                                                                          |
|  [Google Gemini Vision Driver]      [OpenAI Image Edit Driver]      [Self-Hosted IDM-VTON / ComfyUI Node]  |
|                                                                                                            |
|  Data & Object Storage:                                                                                    |
|  - MySQL 8.0 Primary Database (Multi-tenant relational schemas, JSON anchor maps, telemetry)              |
|  - Encrypted S3-Compatible Storage (Private buckets, signed short-lived URLs, automated TTL pruning)      |
+------------------------------------------------------------------------------------------------------------+
```

---

## 16. Monorepo Directory Layout

```
ai-virtual-try-on-kiosk/
├── apps/
│   ├── api/                      # Laravel 12 API + Filament v4 multi-tenant admin
│   ├── kiosk/                    # Next.js kiosk & flagship website PWA
│   └── mobile/                   # Expo React Native mobile application
├── packages/
│   ├── engine/                   # Framework-agnostic Try-On Engine (TypeScript)
│   │   ├── src/
│   │   │   ├── benchmark/        # BenchmarkSuite (FPS, latency, jitter variance)
│   │   │   ├── filters/          # OneEuroFilter & LandmarkOneEuroFilter
│   │   │   ├── math/             # Geometry, affine warping & barycentric math
│   │   │   ├── overlay/          # DebugOverlay HUD (landmarks, skeleton, stats)
│   │   │   ├── pipeline/         # AssetPipeline (auto-category & anchor detection)
│   │   │   ├── strategies/       # Realtime2DWarp, Realtime3D, GenerativeHD
│   │   │   ├── types/            # Typed interfaces for products, anchors, frames
│   │   │   ├── TryOnEngine.ts    # Main orchestrator class
│   │   │   └── index.ts          # Public engine exports
│   │   ├── tests/                # Node.js native unit tests (14/14 passing)
│   │   └── demo/                 # 30+ FPS interactive prototype (HTML, CSS, JS)
│   ├── widget/                   # Sub-100KB vanilla TS embed script
│   └── ui/                       # Shared design system & tokens
├── plugins/
│   ├── shopify/                  # Shopify Theme App Extension
│   └── woocommerce/              # WooCommerce plugin
├── architecture/
│   ├── ARCHITECTURE.md           # Deep-dive system architecture specification
│   ├── SCHEMA.md                 # Full database schema and ERD
│   └── API.md                    # REST API v1 and WebSocket channel contracts
├── scripts/
│   ├── generate_assets.mjs       # Fashion asset generator (SVG cutouts)
│   └── serve_demo.mjs            # Zero-dependency local demo HTTP server
├── ROADMAP.md                    # 12-phase delivery roadmap
├── README.md                     # Master documentation & feature specification
└── package.json                  # Monorepo workspace configuration
```

---

## 17. Quick Start & Verification

### 1. Run Unit Tests (Math & Engine)
```bash
npm test
```
All 14 unit tests verify the mathematical accuracy of the One-Euro filter, 2D garment affine transformations, barycentric weights, and the asset analysis pipeline.

### 2. Launch 30+ FPS Interactive Kiosk Demo
```bash
npm run demo
```
Open **[http://127.0.0.1:8080/demo/index.html](http://127.0.0.1:8080/demo/index.html)** in any browser.

#### Demo Highlights:
- **Reference Kiosk UI**: Translucent "LIVE" indicator at top center, elegant serif typography (*Cormorant Garamond*), category label (`NOIR SILK BLAZER / OUTERWEAR`), and luxury dark glassmorphism styling.
- **Interactive Carousel**: Horizontal circular product carousel featuring Outerwear, Tops, Dresses, and Eyewear.
- **Dual Camera Mode**: Built-in toggle between live Webcam and high-precision 60 FPS simulated human motion model.
- **Layering & Custom Fit**: "Complete the Look" layering (blazer + sunglasses) and interactive sliders for scale, offset, and rotation.
- **3-2-1 Capture & QR Mobile Handoff**: Full snapshot countdown, flash animation, and QR transfer modal.
- **Diagnostic HUD**: Real-time FPS, frame budget, landmark keypoints, and skeleton anchors.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).

---

## 🤝 Let's Build Something Exceptional

I'm actively open to:
**Remote Senior Full-Stack Roles · Freelance Contracts · Technical Partnerships · Long-Term Collaborations**  
in **Laravel · WordPress · React/Next.js · AI-powered Platforms · Security Audits · SaaS Architecture**

📍 **Timezone:** UTC+6 (Dhaka/Rangpur) — flexible overlap for US, EU & Asia  
⚡ **Available:** Immediately · Production-first · Fast delivery · Transparent communication

| Platform | Link |
| :--- | :--- |
| 🌐 **Portfolio** | [imrandev.bd](https://imrandev.bd/) |
| 💼 **LinkedIn** | [linkedin.com/in/imranbru99](https://www.linkedin.com/in/imranbru99/) |
| 🐙 **GitHub** | [github.com/imranbru99](https://github.com/imranbru99) |
| 🐦 **X / Twitter** | [@imrandev_bd](https://x.com/imrandev_bd) |
| 📺 **YouTube** | [@ImranDevBD](https://www.youtube.com/@ImranDevBD) |
| 📸 **Instagram** | [@imranbru99](https://www.instagram.com/imranbru99/) |
| 📘 **Facebook** | [ExpertImranDev](https://www.facebook.com/ExpertImranDev/) |
| 🎵 **TikTok** | [@imrandev_bd](https://www.tiktok.com/@imrandev_bd) |
| 🧵 **Threads** | [@imranbru99](https://www.threads.com/@imranbru99) |
| 📌 **Pinterest** | [@imrandev_bd](https://www.pinterest.com/imrandev_bd/) |
| 💬 **WhatsApp** | [+880 1576-918420](http://wa.me/+8801576918420) |
| 📧 **Email** | [me@imrandev.bd](mailto:me@imrandev.bd) |
| 🔗 **All Links** | [linktr.ee/ExpertImranDev](https://linktr.ee/ExpertImranDev) |

> *"Security isn't an add-on — it's the foundation. Scale, speed, and trust drive every line of code I write."*  
> — **Imran Ahmed**
