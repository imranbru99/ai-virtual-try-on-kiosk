# REST API & WebSocket Specification: AI Virtual Try-On Kiosk

Version: `v1`  
Protocol: `HTTPS` (REST) & `WSS` (Laravel Reverb / WebSockets)  
Auth Mechanisms: 
- Bearer Sanctum Token (Admin / Staff users)
- `X-Kiosk-Key` / Kiosk Token (Registered Kiosk Fleet Devices)
- `X-Brand-Key` (Public Web / E-Commerce Widgets)

---

## 1. REST API Route Directory

### 1.1 Kiosk Device Lifecycle & Fleet Management
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/kiosks/pair` | Public (Rate Limited) | Submit 6-character pairing code displayed on kiosk to link with store |
| `GET` | `/api/v1/kiosks/config` | `X-Kiosk-Key` | Fetch latest active brand theme, catalog subset, idle video, and settings |
| `POST` | `/api/v1/kiosks/heartbeat` | `X-Kiosk-Key` | Report telemetry: FPS, CPU, Memory, GPU temp, camera status, app version |
| `POST` | `/api/v1/kiosks/commands/ack` | `X-Kiosk-Key` | Acknowledge execution of remote command (reload, reboot, cache purge) |

### 1.2 Catalog & Product Assets (Edge Sync & Web)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/catalog/categories` | Brand / Kiosk | List active categories with try-on strategy (`warp_2d`, `mesh_3d`, etc.) |
| `GET` | `/api/v1/catalog/products` | Brand / Kiosk | Paginated catalog with variants, cutouts, 3D glTF models, and anchor maps |
| `GET` | `/api/v1/catalog/products/{id}` | Brand / Kiosk | Retrieve single product details, local store stock, and related combos |
| `GET` | `/api/v1/catalog/bundle` | `X-Kiosk-Key` | Download offline SQLite/JSON bundle of entire store catalog & asset URLs |

### 1.3 Try-On Sessions & Analytics
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/sessions/start` | Brand / Kiosk | Initialize interactive session upon motion detection or touch |
| `POST` | `/api/v1/sessions/{id}/event` | Brand / Kiosk | Log interaction: item tried, variant changed, compare mode toggled |
| `POST` | `/api/v1/sessions/{id}/end` | Brand / Kiosk | End session, compute duration and engagement metrics |

### 1.4 Looks, Captures & HD Generative Rendering
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/looks/capture` | Brand / Kiosk | Save an instant snapshot look with watermark & generate short QR share token |
| `POST` | `/api/v1/renders/jobs` | Brand / Kiosk | Dispatch async Photorealistic Generative HD try-on job (Gemini/OpenAI/IDM-VTON) |
| `GET` | `/api/v1/renders/jobs/{id}` | Brand / Kiosk | Poll render job status, progress percentage, and final high-res output URL |
| `GET` | `/api/v1/looks/{share_token}` | Public | Public landing page data for scanned QR code (photos, products, cart handoff) |
| `DELETE`| `/api/v1/looks/{share_token}` | Public | Right to be Forgotten: one-click instant deletion of customer's photos |

### 1.5 In-Store Staff Assistance & Commerce
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/staff/requests` | `X-Kiosk-Key` | Dispatch "Ask Staff" alert: kiosk ID, product SKU, and requested size |
| `GET` | `/api/v1/staff/requests` | Sanctum (Staff) | Live queue of pending customer requests on store tablet |
| `PATCH`| `/api/v1/staff/requests/{id}` | Sanctum (Staff) | Update status: `acknowledged` -> `resolved` |
| `POST` | `/api/v1/coupons/reveal` | Brand / Kiosk | Issue gamified coupon (spin-to-win) bound to current session |
| `POST` | `/api/v1/coupons/validate` | Sanctum / POS | Validate coupon code and record POS redemption |
| `POST` | `/api/v1/leads` | Brand / Kiosk | Store opt-in customer phone/email from QR screen or gamification modal |

---

## 2. WebSockets & Realtime Channels (Laravel Reverb)

### 2.1 Fleet Remote Control
- **Channel**: `private-kiosk.{kiosk_id}`
- **Events**:
  - `RemoteCommandDispatched`: `{ command: "reload" | "refresh_cache" | "reboot" }`
  - `ThemeUpdated`: `{ brand_id, updated_at }`
  - `CatalogSyncRequested`: `{ version, download_url }`

### 2.2 Live HD Render Progress
- **Channel**: `private-session.{session_id}`
- **Events**:
  - `RenderProgressUpdated`: `{ job_id, stage: "segmenting" | "diffusion" | "upscaling", progress_percent: 45 }`
  - `RenderCompleted`: `{ job_id, look_id, hd_image_url }`
  - `RenderFailed`: `{ job_id, error_code, fallback_to_realtime: true }`

### 2.3 In-Store Staff Tablet
- **Channel**: `private-store.{store_id}.staff`
- **Events**:
  - `StaffAssistanceRequested`: `{ request_id, kiosk_name, product_name, size, thumbnail_url, timestamp }`
