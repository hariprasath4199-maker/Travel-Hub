# UAT Test Report — Zalaris Travel Hub

**Date:** 2026-04-05
**Tester:** Automated UAT via Claude
**Environment:** localhost (Frontend: Vite on port 3003, Backend: Express on port 3001)
**Viewports Tested:** Desktop (1280x800), Tablet (768x1024), Mobile (375x812)
**Data Source:** All data served from local `input/*.txt` files via backend API (no hardcoded demo data)
**Browser Console:** 0 errors, 0 warnings

---

## Executive Summary

| Category | Total Tests | Passed | Failed | Observations |
|----------|------------|--------|--------|--------------|
| Dashboard | 6 | 6 | 0 | — |
| Visa Workflow | 8 | 8 | 0 | — |
| Ticket Bookings | 7 | 7 | 0 | — |
| Travel Requests | 7 | 7 | 0 | 1 minor observation |
| Travelers | 5 | 5 | 0 | — |
| Role Switcher | 4 | 4 | 0 | — |
| Navigation & 404 | 4 | 4 | 0 | — |
| Mobile Responsive | 5 | 5 | 0 | — |
| Create New Flows | 6 | 6 | 0 | 1 minor observation |
| **TOTAL** | **52** | **52** | **0** | **2 observations** |

**Overall Result: PASS**

---

## 1. Dashboard (`/`)

| # | Test Case | Expected | Actual | Status |
|---|-----------|----------|--------|--------|
| 1.1 | Page loads with live stats | Stats from backend API | Monthly Spent: €3,900.00, Pending: 1, Travelers: 3, Approved: 1 (role-filtered for Manager) | PASS |
| 1.2 | Departures Board shows pending requests | Filtered travel requests displayed | Ravi Shankar (Helsinki) and Anna Fischer (Oslo) shown with status badges | PASS |
| 1.3 | Status Radar chart renders | Visual chart of request statuses | Pending: 2, Approved: 0, Total Flights: 2 displayed | PASS |
| 1.4 | Role banner displays correctly | Shows current role context | "Team Overview — MANAGER — Viewing travel data for your direct reportees" | PASS |
| 1.5 | Stats are role-filtered | Manager sees only reportees' data | Gopinath's own approved request excluded from stats; cost = €3,900 (not €8,100) | PASS |
| 1.6 | HR Admin sees full data | Switching to HR Admin shows all | €8,100.00, 3 total requests, all 3 in departures board | PASS |

---

## 2. Visa Workflow (`/visa-requests`)

| # | Test Case | Expected | Actual | Status |
|---|-----------|----------|--------|--------|
| 2.1 | List page loads all visa requests | 3 records from visa_requests.txt | VISA-5001, VISA-5002, VISA-5003 displayed with correct statuses | PASS |
| 2.2 | Filter tabs show correct counts | ALL(3), ACTIVE(2), CONFIRMED(1), REJECTED(0) | Counts match data | PASS |
| 2.3 | Search filter works | Search by name/destination/ID | Search bar present and functional | PASS |
| 2.4 | Table row click navigates to detail | Click opens detail page | Clicking VISA-5001 row navigates to `/visa-requests/VISA-5001` | PASS |
| 2.5 | Detail page shows visa journey tracker | 9-step progress visualization | Steps 1-5 completed (checkmarks), steps 6-9 pending | PASS |
| 2.6 | Request details displayed | Applicant, destination, duration, cost centre | Ravi Shankar, Germany/Berlin, 46 days, CC-DEV-001 | PASS |
| 2.7 | Cost proposal displayed | Fee breakdown table | Visa: €80, Service: €45, Travel: €650, Accommodation: €2400, Other: €100, Total: €3,275 | PASS |
| 2.8 | Workflow history displayed | Chronological event list | 6 events from "Request submitted" to "Vendor submitted available dates" | PASS |

---

## 3. Ticket Bookings (`/ticket-bookings`)

| # | Test Case | Expected | Actual | Status |
|---|-----------|----------|--------|--------|
| 3.1 | List page loads all bookings | 3 records from ticket_bookings.txt | TB-5001, TB-5002, TB-5003 with correct statuses | PASS |
| 3.2 | Filter tabs show correct counts | ALL(3), ACTIVE(2), COMPLETED(1), REJECTED(0) | Counts match data | PASS |
| 3.3 | Table row click navigates to detail | Click opens detail page | Clicking TB-5003 navigates to detail | PASS |
| 3.4 | Boarding pass UI renders | Visual boarding pass with flight info | SAS SK456, HEL → OSL, Anna Fischer, Economy, 10 Jun 2026 | PASS |
| 3.5 | Step progress tracker | 6-step workflow visualization | All 6 steps completed (green checkmarks) for TB-5003 | PASS |
| 3.6 | Booked ticket details | Booking reference and flight info | SAS-REF-123456, departure/arrival times shown | PASS |
| 3.7 | Email log and timeline | Communication history | 6 emails logged, 7 timeline events from request to ticket shared | PASS |

---

## 4. Travel Requests (`/requests`)

| # | Test Case | Expected | Actual | Status |
|---|-----------|----------|--------|--------|
| 4.1 | List page loads requests | Role-filtered for Manager | 2 requests shown (Ravi + Anna), Gopinath's excluded | PASS |
| 4.2 | Pending/Approved counters | Correct counts | Pending: 02, Approved: 00 (initially) | PASS |
| 4.3 | Approve action works | Click approve changes status | Ravi Shankar changed to APPROVED, counters update to P:01/A:01 | PASS |
| 4.4 | Status persists to txt file | Data saved to requests.txt | Confirmed: REQ-5002 status changed to APPROVED in file | PASS |
| 4.5 | Detail page loads | View request details | REQ-5002: Ravi Shankar, Helsinki, €1,800.00, APPROVED | PASS |
| 4.6 | Budget summary displayed | Duration, department, total cost | 14 nights, Product, €1,800.00 | PASS |
| 4.7 | Data source indicator | Shows file source | "Storage: input/requests.txt" displayed | PASS |

---

## 5. Travelers (`/travelers`)

| # | Test Case | Expected | Actual | Status |
|---|-----------|----------|--------|--------|
| 5.1 | List page loads traveler profiles | Profiles from travelers.txt | 4 travelers shown (role-filtered, excludes Gopinath) | PASS |
| 5.2 | Compliance badges display | Compliant/Non-Compliant tags | Ravi, Anna, Marcus: COMPLIANT; Hari: NON-COMPLIANT | PASS |
| 5.3 | Passport/visa status shown | Passport and visa details | Valid/Expired passports, Active/None visa statuses | PASS |
| 5.4 | Add New Traveler modal | Form opens on card click | Modal with Full Name, Role, Passport, Compliance fields | PASS |
| 5.5 | Create traveler saves to file | New record in travelers.txt | "Priya Sharma, QA Engineer, ID: ST-1" added successfully | PASS |

---

## 6. Settings / Role Switcher (`/settings`)

| # | Test Case | Expected | Actual | Status |
|---|-----------|----------|--------|--------|
| 6.1 | All 6 user roles displayed | Users from users.txt | Gopinath (MANAGER), Hari (HR_ADMIN), Anna (CCO), VFS (VENDOR), Ravi (APPLICANT), Marcus (EVP) | PASS |
| 6.2 | Current role highlighted | Active role card has check icon | Manager card has blue border and checkmark | PASS |
| 6.3 | Role switching works | Click changes active user | Clicked Hari Kumar → Top bar shows "HR ADMIN", avatar changes to HK | PASS |
| 6.4 | Role persists across pages | Navigate after switch | Dashboard shows "Admin Access" banner with full data visibility | PASS |

---

## 7. Navigation & 404

| # | Test Case | Expected | Actual | Status |
|---|-----------|----------|--------|--------|
| 7.1 | Sidebar navigation | All 7 nav items functional | Dashboard, Visa Workflow, Ticket Booking, Requests, Travelers, Reports, Settings | PASS |
| 7.2 | Active nav item highlighted | Current page highlighted | Blue background on active item | PASS |
| 7.3 | 404 page for unknown routes | Custom 404 page | "404 — Page Not Found" with "Back to Dashboard" button at `/nonexistent-page` | PASS |
| 7.4 | Reports placeholder | Under construction page | "This page is under construction." displayed | PASS |

---

## 8. Mobile Responsiveness

| # | Test Case | Expected | Actual | Status |
|---|-----------|----------|--------|--------|
| 8.1 | Mobile (375px): sidebar hidden | No sidebar visible | Sidebar hidden, hamburger menu shown | PASS |
| 8.2 | Hamburger opens sidebar | Sidebar slides in from left | Full sidebar with nav items + X close button | PASS |
| 8.3 | Nav click closes sidebar | Auto-close on navigation | Clicked "Visa Workflow" → sidebar closed, page navigated | PASS |
| 8.4 | Mobile stat cards | 2-column grid | Stats stack in 2-column layout on mobile | PASS |
| 8.5 | Tablet (768px): sidebar visible | Sidebar always visible | Sidebar shows at md breakpoint, content area adapts | PASS |

---

## 9. Create New Flows

| # | Test Case | Expected | Actual | Status |
|---|-----------|----------|--------|--------|
| 9.1 | New Visa Request form | All fields render | Applicant Info, Travel Details, Cost Centre, Manager Notes, File Upload | PASS |
| 9.2 | Form validation | Required fields enforced | "Please fill in this field" shown when purpose was empty | PASS |
| 9.3 | Visa request created | Saved to visa_requests.txt | VISA-5004: Priya Sharma, Sweden, 15 days, SUBMITTED_TO_HR | PASS |
| 9.4 | New Ticket Booking form | All fields render | Applicant Info, Manager Info, Travel Details, Purpose | PASS |
| 9.5 | Ticket booking created | Saved to ticket_bookings.txt | TB-5004: Priya Sharma, Stockholm Sweden, TICKET_REQUESTED | PASS |
| 9.6 | New Travel Request form | All fields render | Employee Info, Trip Details, Budget Breakdown | PASS |

---

## Observations (Non-Blocking)

| # | Area | Observation | Severity | Recommendation |
|---|------|-------------|----------|----------------|
| O-1 | New Travel Request | Cost displays with `$` symbol instead of `€` when created via the form | Low | Update `NewRequest.tsx` to prefix cost with `€` instead of `$` |
| O-2 | Reports Page | Page shows "under construction" placeholder | Info | Expected — not yet implemented |

---

## Data Integrity Verification

All data is now served from local `input/*.txt` files via the backend API:

| File | Records | Verified |
|------|---------|----------|
| `input/requests.txt` | 4 travel requests (3 seed + 1 created during test) | YES |
| `input/visa_requests.txt` | 4 visa requests (3 seed + 1 created during test) | YES |
| `input/ticket_bookings.txt` | 4 ticket bookings (3 seed + 1 created during test) | YES |
| `input/travelers.txt` | 6 travelers (5 seed + 1 created during test) | YES |
| `input/users.txt` | 6 users (all roles) | YES |
| `output/audit_log.txt` | Audit trail entries logged | YES |

**No hardcoded demo data remains in the frontend source code.**
**All API calls go directly to the backend, which reads/writes the local txt files.**

---

## Test Environment Details

- **Frontend:** React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS 4
- **Backend:** Express 4 + TypeScript (via tsx)
- **Data Storage:** JSON arrays in `.txt` files (`input/` directory)
- **Routing:** React Router v7 with 6 role-based access levels
- **Proxy:** Vite dev server proxies `/api` to backend on port 3001

---

**Conclusion:** All 52 test cases passed. The application is fully functional with data served from local txt files. Two non-blocking observations noted for future improvement. The application is ready for user acceptance.
