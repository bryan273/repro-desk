---
last_updated: 2026-10-24T17:40:19Z
---

# Architecture Design

## System Overview
Repro Desk bilingual (EN/中文) landing page + admin request list. Visitors submit reproduction requests (paper link, claim, email, plan) saved to Atoms Cloud DB; admins (Atoms auth, role=admin) list and update status at /admin.

## Tech Stack
Vite + React + TS + shadcn/ui + Tailwind + GSAP (ScrollTrigger); FastAPI backend on Atoms Cloud; @metagptx/web-sdk.

## Module Design
| Module | Responsibility | Key Files |
|--------|---------------|-----------|
| i18n | EN/ZH copy + language context (localStorage) | src/lib/content.ts, src/contexts/LanguageContext.tsx |
| Landing | Hero, steps, sample report, pricing, FAQ, form | src/pages/Index.tsx, src/components/SiteHeader.tsx, src/components/RequestForm.tsx |
| Admin | Login gate, list/filter/paginate, status update | src/pages/Admin.tsx |
| API | Public POST create; admin-only GET list + PUT status | app/backend/routers/repro_requests.py |

## Tech Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Table access | repro_requests create_only=false, router hardened | Anonymous submit; listing restricted via get_admin_user |
| Admin auth | Atoms auth role=admin | No second auth system |

## File Tree Plan
See Module Design key files.

## Implementation Guide
Admin calls use client.apiCall.invoke against /api/v1/entities/repro_requests; form uses client.entities.repro_requests.create({data}).

