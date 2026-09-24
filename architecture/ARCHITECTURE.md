# System Architecture: AI Virtual Try-On Kiosk

## 1. System Overview

**AI Virtual Try-On Kiosk** is an enterprise-grade, multi-tenant virtual try-on platform engineered for retail flagships, shopping malls, exhibitions, brand websites, headless e-commerce stores, and mobile applications.

The platform provides instant sub-100ms client-side try-on preview utilizing computer vision landmarks (MediaPipe) and WebGL/Canvas/Three.js, accompanied by an asynchronous, server-side Photorealistic Generative HD rendering pipeline powered by Gemini Vision, OpenAI, or self-hosted diffusion backends (IDM-VTON / OOTDiffusion).

```
                                  +------------------------------------------+
                                  |            CLIENT DEPLOYMENTS            |
                                  +------------------------------------------+
                                  | 1. In-Store Touch Kiosk (Next.js PWA)    |
                                  | 2. Brand Flagship Website (Next.js)      |
                                  | 3. E-Commerce Widget (<100KB Vanilla TS) |
                                  | 4. Native Mobile (Expo React Native)     |
                                  +--------------------+---------------------+
                                                       |
                                            MediaPipe Vision Stream
                                     (Pose, Face, Hand, Segmentation)
                                                       |
                                                       v
                                  +------------------------------------------+
                                  |     packages/engine (TryOnEngine)        |
                                  +------------------------------------------+
                                  | [Strategy A: 2D Warp Engine]             |
                                  |   - One-Euro Jitter Filter               |
                                  |   - Torso / Shoulder / Neck Anchors      |
                                  |   - Multi-point Affine / Perspective Mesh|
                                  |   - Occlusion Masking (Body & Hair)      |
                                  +------------------------------------------+
                                  | [Strategy B: 3D Three.js Engine]         |
                                  |   - Head Pose / PnP Matrix Tracking      |
                                  |   - glTF/GLB PBR Shaders                 |
                                  |   - Environment Light Estimation         |
                                  +------------------------------------------+
                                  | [Strategy C: Generative HD Client]       |
                                  |   - Snapshot Capture + Pre-align         |
                                  |   - Async Job Queue Poll / Reverb WS     |
                                  +--------------------+---------------------+
                                                       |
                                            HTTPS / REST v1 / WSS
                                                       |
                                                       v
+------------------------------------------------------------------------------------------------------------+
|                                           BACKEND INFRASTRUCTURE                                           |
+------------------------------------------------------------------------------------------------------------+
|  Laravel 12 REST API + Sanctum + Spatie Multitenancy                                                       |
|  - Multi-tenant scoping: Organization -> Brand -> Store -> Kiosk Fleet                                     |
|  - Realtime Event Server: Laravel Reverb (WebSockets)                                                      |
|  - Admin Dashboard: Filament v4 Admin Panel                                                                |
|                                                                                                            |
|  Queues & Caching (Redis + Laravel Horizon):                                                               |
|  - queue: high (Kiosk Telemetry, Staff Alerts, Pairing)                                                    |
|  - queue: default (Analytics Ingestion, Coupon Sync)                                                       |
|  - queue: ai-renders (Generative Diffusion & Gemini Pipelines)                                             |
|                                                                                                            |
|  Pluggable AI Driver Interface:                                                                            |
|  +---------------------------+   +---------------------------+   +--------------------------------------+  |
|  | Google Gemini Vision Driver|  | OpenAI Image Edit Driver  |  | Self-Hosted IDM-VTON / OOTDiffusion  |  |
|  +---------------------------+   +---------------------------+   +--------------------------------------+  |
|                                                                                                            |
|  Storage & Caching:                                                                                        |
|  - S3-compatible Object Storage (Encrypted at rest, signed short-lived URLs, auto-pruning lifecycle)       |
|  - MySQL 8.0 Primary DB (JSON columns for anchor maps, telemetry, and tenant configs)                      |
|  - Redis 7.2 (Session state, rate-limiting, temporary landmark caches, Reverb Pub/Sub)                     |
+------------------------------------------------------------------------------------------------------------+
```

---

## 2. Core Architectural Principles

### 2.1 Multi-Tenant Hierarchy
- **Organization (Master Account)**: Owns subscription billing, corporate-wide user identities, and top-level policies.
- **Brand**: Isolated brand identity, styling tokens (fonts, colors, logos), product catalog, and AI prompt configurations.
- **Store**: Physical retail store or online storefront location with localized staff tablets, inventory constraints, and local currency.
- **Kiosk (Device Node)**: Physical hardware instance bound by an ephemeral pairing code, with fleet health telemetry, offline catalog caches, and localized display configurations.

### 2.2 Client-Side Try-On Engine (`packages/engine`)
The engine is framework-agnostic TypeScript designed to run anywhere HTML5 Canvas, WebGL, or WebGPU is available:
- **Zero-Latency Visual Feedback**: Runs at a minimum target of 30-60 FPS locally using Web Workers for MediaPipe landmark inference, decoupling heavy vision calculations from the UI rendering thread.
- **One-Euro Filtering**: Suppresses landmark tracking jitter while preserving responsiveness during rapid physical movement.
- **Occlusion Handling**: Leverages MediaPipe Selfie Segmentation masks to ensure hands and hair render naturally over garments and accessories.
- **Graceful Quality Fallbacks**: Monitors frame budget in real-time. If FPS drops below 24 FPS, the engine seamlessly reduces segmentation resolution and switches from 3D glTF PBR shaders to simplified 2.5D planar billboarding.

### 2.3 Generative HD Try-On (Server Pipeline)
While client-side 2D/3D overlays deliver immediate live interactivity, customers can trigger an **HD AI Try-On** render:
1. Client captures a high-resolution uncompressed frame from the camera stream along with MediaPipe bounding boxes.
2. An ephemeral signed S3 upload URL is requested via the API.
3. The client submits a `render_job` specifying product ID, garment mask, and user capture.
4. The backend queues the job via Laravel Horizon on dedicated GPU workers or external APIs (Gemini 2.5 Flash / Pro, OpenAI DALL-E/ImageEdit, or self-hosted IDM-VTON ComfyUI/Triton nodes).
5. Progress (Queued -> Ingesting -> Inpainting -> Refining -> Ready) is broadcast to the kiosk via Laravel Reverb WebSockets.
6. The final photorealistic composite is rendered and cached by `(person_feature_hash, product_sku)`.

### 2.4 Privacy & Edge Isolation
- Raw video frames **never leave the kiosk** during live browsing. All computer vision landmark detection and 2D/3D warping execute locally on the GPU/WASM in the client's memory.
- Captures are only uploaded when the user explicitly presses the circular capture button and consents.
- Generated looks have an automated TTL retention policy (default 2 hours for anonymous kiosk sessions), after which assets are automatically purged from S3 and database records are scrubbed.
- Immediate "Delete My Data" capability via the QR look page.
