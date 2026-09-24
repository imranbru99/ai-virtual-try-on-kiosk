# Database Schema: AI Virtual Try-On Kiosk

## 1. Entity Relationship Diagram (Mermaid ERD)

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ BRANDS : owns
    ORGANIZATIONS ||--o{ USERS : employs
    BRANDS ||--o{ STORES : operates
    BRANDS ||--o{ CATEGORIES : defines
    BRANDS ||--o{ PRODUCTS : catalogues
    BRANDS ||--o{ COUPONS : issues
    STORES ||--o{ KIOSKS : hosts
    STORES ||--o{ STAFF_REQUESTS : handles

    CATEGORIES ||--o{ PRODUCTS : categorizes
    CATEGORIES ||--o{ CATEGORIES : subcategories
    PRODUCTS ||--o{ PRODUCT_VARIANTS : has
    PRODUCTS ||--o{ PRODUCT_ASSETS : contains
    PRODUCT_VARIANTS ||--o{ PRODUCT_ASSETS : maps_to

    KIOSKS ||--o{ KIOSK_TELEMETRY : logs
    KIOSKS ||--o{ KIOSK_COMMANDS : receives
    KIOSKS ||--o{ SESSIONS : records
    KIOSKS ||--o{ STAFF_REQUESTS : triggers

    SESSIONS ||--o{ LOOKS : captures
    SESSIONS ||--o{ ANALYTICS_EVENTS : tracks
    SESSIONS ||--o{ LEADS : captures

    LOOKS ||--o{ RENDER_JOBS : triggers
    LOOKS ||--o{ SHARE_TOKENS : generates

    USERS ||--o{ AUDIT_LOGS : actions

    ORGANIZATIONS {
        uuid id PK
        string name
        string slug UK
        string plan
        string billing_status
        int max_kiosks
        json settings
        timestamp created_at
        timestamp updated_at
    }

    BRANDS {
        uuid id PK
        uuid organization_id FK
        string name
        string slug UK
        string domain UK
        string logo_url
        json theme_config
        string idle_video_url
        string default_language
        json available_languages
        timestamp created_at
        timestamp updated_at
    }

    STORES {
        uuid id PK
        uuid brand_id FK
        string name
        string code UK
        string city
        string country
        string currency
        string timezone
        string address
        timestamp created_at
        timestamp updated_at
    }

    KIOSKS {
        uuid id PK
        uuid store_id FK
        uuid brand_id FK
        string name
        string serial_number UK
        string pairing_code UK
        timestamp pairing_expires_at
        boolean is_paired
        timestamp paired_at
        enum status "online | offline | maintenance"
        string app_version
        string ip_address
        json device_specs
        json hardware_config
        timestamp last_heartbeat_at
        timestamp created_at
        timestamp updated_at
    }

    KIOSK_TELEMETRY {
        bigint id PK
        uuid kiosk_id FK
        float fps
        float cpu_percent
        float mem_percent
        float gpu_percent
        float temp_c
        boolean is_camera_ok
        int network_latency_ms
        timestamp recorded_at
    }

    KIOSK_COMMANDS {
        uuid id PK
        uuid kiosk_id FK
        enum command "reload | reboot | refresh_cache | screenshot | lock"
        json payload
        enum status "pending | acknowledged | executed | failed"
        timestamp executed_at
        timestamp created_at
        timestamp updated_at
    }

    CATEGORIES {
        uuid id PK
        uuid brand_id FK
        uuid parent_id FK
        string name
        string slug
        enum tryon_strategy "warp_2d | mesh_3d | cosmetic | generative"
        int sort_order
        string icon_svg
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    PRODUCTS {
        uuid id PK
        uuid brand_id FK
        uuid category_id FK
        string name
        string slug
        string sku UK
        text description
        decimal price
        string currency
        string external_url
        json tags
        enum gender "unisex | men | women | kids"
        boolean is_active
        json metadata
        timestamp created_at
        timestamp updated_at
    }

    PRODUCT_VARIANTS {
        uuid id PK
        uuid product_id FK
        string sku UK
        string color_name
        string color_hex
        string size
        int stock_quantity
        decimal price_override
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    PRODUCT_ASSETS {
        uuid id PK
        uuid product_id FK
        uuid variant_id FK
        enum asset_type "cutout_png | model_glb | texture_map | normal_map"
        string file_path
        int file_size_bytes
        json dimensions
        json anchor_map
        boolean is_default
        timestamp created_at
        timestamp updated_at
    }

    SESSIONS {
        uuid id PK
        uuid kiosk_id FK
        uuid brand_id FK
        uuid store_id FK
        string session_token UK
        timestamp started_at
        timestamp ended_at
        int duration_seconds
        int person_count
        json profile_preferences
        timestamp created_at
        timestamp updated_at
    }

    LOOKS {
        uuid id PK
        uuid session_id FK
        uuid kiosk_id FK
        uuid brand_id FK
        string preview_image_url
        string hd_image_url
        enum composite_type "instant_capture | hd_render | boomerang_gif"
        json items_tried
        string share_token UK
        boolean is_favorite
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    RENDER_JOBS {
        uuid id PK
        uuid look_id FK
        uuid session_id FK
        uuid brand_id FK
        enum driver "gemini | openai | diffusion_idm"
        enum status "queued | processing | completed | failed"
        int priority
        int cost_cents
        text error_message
        int latency_ms
        json payload
        timestamp created_at
        timestamp updated_at
    }

    STAFF_REQUESTS {
        uuid id PK
        uuid kiosk_id FK
        uuid store_id FK
        uuid product_id FK
        uuid variant_id FK
        string requested_size
        enum status "pending | acknowledged | resolved | cancelled"
        text notes
        timestamp acknowledged_at
        timestamp resolved_at
        timestamp created_at
        timestamp updated_at
    }

    COUPONS {
        uuid id PK
        uuid brand_id FK
        string campaign_name
        string code UK
        enum discount_type "percentage | fixed"
        decimal discount_value
        decimal min_spend
        int max_redemptions
        int redeemed_count
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    LEADS {
        uuid id PK
        uuid brand_id FK
        uuid store_id FK
        uuid session_id FK
        string email
        string phone
        boolean consent_marketing
        enum source "kiosk_qr | web_widget | mobile"
        timestamp created_at
        timestamp updated_at
    }

    ANALYTICS_EVENTS {
        bigint id PK
        uuid brand_id FK
        uuid store_id FK
        uuid kiosk_id FK
        uuid session_id FK
        string event_type
        json event_data
        timestamp event_timestamp
    }

    USERS {
        uuid id PK
        uuid organization_id FK
        uuid brand_id FK
        uuid store_id FK
        string name
        string email UK
        string password
        string role
        string two_factor_secret
        timestamp email_verified_at
        timestamp created_at
        timestamp updated_at
    }

    AUDIT_LOGS {
        bigint id PK
        uuid user_id FK
        uuid organization_id FK
        string action
        string auditable_type
        uuid auditable_id
        json old_values
        json new_values
        string ip_address
        text user_agent
        timestamp created_at
    }
```

---

## 2. Key Data Structures (JSON Schemas)

### 2.1 Product Asset `anchor_map`
Specifies exact MediaPipe landmark mappings for the 2D warp or 3D alignment engine:
```json
{
  "category": "tops",
  "anchors": {
    "left_shoulder": { "landmark_id": 11, "uv": [0.22, 0.18] },
    "right_shoulder": { "landmark_id": 12, "uv": [0.78, 0.18] },
    "left_hip": { "landmark_id": 23, "uv": [0.28, 0.85] },
    "right_hip": { "landmark_id": 24, "uv": [0.72, 0.85] },
    "neck_center": { "landmark_id": 0, "uv": [0.50, 0.15], "virtual": true }
  },
  "scaling": {
    "reference_width_ratio": 1.25,
    "vertical_slack_ratio": 1.10
  },
  "occlusion": {
    "mask_arms": true,
    "mask_hair": true,
    "tuck_mode": "untucked"
  }
}
```

### 2.2 Kiosk `hardware_config`
Local runtime controls dispatched remotely:
```json
{
  "camera": {
    "device_id": "default",
    "target_fps": 60,
    "preferred_resolution": { "width": 1080, "height": 1920 },
    "mirror_mode": true,
    "exposure_mode": "auto"
  },
  "display": {
    "orientation": "portrait",
    "fullscreen_on_boot": true,
    "idle_timeout_seconds": 60
  },
  "audio": {
    "volume_percent": 75,
    "voice_prompts_enabled": true
  },
  "peripherals": {
    "thermal_printer_enabled": false,
    "pir_motion_wake": true
  }
}
```
