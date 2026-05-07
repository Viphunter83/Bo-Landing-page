# Multi-Tenant Architecture Documentation

## Overview
This project has been transitioned from a single-restaurant landing page to a multi-tenant platform. This allows multiple brands (e.g., "Bo Restaurant", "Luna & Co.") to share the same codebase while maintaining unique configurations, themes, and content.

## Key Concepts

### 1. Tenant Configuration (`app/lib/config/tenant.ts`)
The `tenantConfig` object is the single source of truth for each tenant. It includes:
- **ID**: Unique identifier (e.g., `bo_dubai`, `luna_hcmc`).
- **Branding**: Name, slogan, and metadata.
- **Theme**: HSL color tokens (primary, background, etc.).
- **Localization**: Supported languages and default locale.
- **Features**: Flags to enable/disable specific sections (e.g., `hasBooking`, `hasSmartMenu`).

### 2. Environment Variable
The active tenant is determined by the `NEXT_PUBLIC_TENANT_ID` environment variable.
- In Vercel, this is set per project/environment.
- Local development defaults to `bo_dubai` if not specified.

### 3. Dynamic Styling
We use CSS variables and Tailwind classes. Themes are injected into the `:root` via the `TenantProvider` (or similar logic in `layout.tsx`). Components use `bg-primary`, `text-primary`, etc., to adapt automatically.

### 4. Database Isolation
Firestore queries (like the Menu) are filtered by `tenantId`. Every document in shared collections MUST have a `tenantId` field.

## Current Tenants
- **Bo Restaurant (Dubai)**: Premium dining experience in Dubai.
- **Luna & Co. (HCMC)**: Rooftop atmospheric space in Ho Chi Minh City.

## Component Status (Tenant Awareness)
| Component | Status | Notes |
| :--- | :--- | :--- |
| Navbar | ✅ Complete | Dynamic brand name and subtitle. |
| Footer | ✅ Complete | Localized "Get Directions" and links. |
| Hero | ✅ Complete | Consumes slogan and name from config. |
| SmartMenu | ✅ Complete | Firestore filtered by tenantId. |
| BookingModal | ✅ Complete | Localized labels, vn support. |
| LanguageSwitcher | ✅ Complete | Supported languages from config. |
| FAQ | ✅ Complete | Uses config content. |

## Vietnamese Support (`vn`)
The project now supports Vietnamese for the `luna_hcmc` tenant. Ensure `app/data/content.ts` is updated with `vn` keys for all UI strings.
