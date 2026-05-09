# حاجز (Hajiz) — Admin Dashboard Project Brief

## Overview
Vue 3 admin dashboard for managing the Hajiz multi-service booking marketplace.
Controls all platform operations: users, businesses, craftsmen, bookings, complaints, and financial settings.

## Tech Stack
- Vue 3 (Composition API + script setup)
- Tailwind CSS v3
- Pinia (state management)
- Vue Router
- Axios (HTTP client)
- Vite (build tool)

## Backend API
- Production: https://hajez-backend-new-production.up.railway.app/api
- Auth: JWT Bearer token

## Pages (Total: 20+)
### Existing
- Dashboard
- Businesses list and detail
- Customers list and detail
- Categories
- Bookings
- Notifications
- Reports
- Revenue

### Added / Completed
- Applications list and detail
- Users
- Commissions
- Craftsmen list and detail
- Professions
- Occasions
- Service Requests list and detail
- Complaints list and detail
- Broadcast Notifications
- Platform Settings

## Admin Capabilities
1. View platform statistics and analytics
2. Approve/reject business applications
3. Approve/reject craftsman applications
4. Manage categories and sub-categories
5. Manage craftsman professions
6. Manage booking occasions
7. Monitor all bookings and service requests
8. Manage commissions and mark payments
9. Handle user complaints
10. Send broadcast notifications to users
11. Configure platform financial settings (commission rates, cancellation policies)
12. Create admin accounts
13. Suspend/activate users, businesses, and craftsmen

## Financial Settings (Configurable)
- Service commission: 5% (default)
- Restaurant per-person fee: $5 (default)
- Customer craftsman fee: 10% (default)
- Craftsman provider fee: 15% (default)
- Cancellation penalty: 5% (default)
- Cancellation deadline: 3 hours (default)
- Booking reminders: 6 hours + 1 hour before

## Design
- RTL Arabic interface
- Dark navy sidebar + white content area
- Blue primary accent (#2563EB)
- Responsive tables with hover actions
- Modal dialogs for forms and confirmations
- Status badges with semantic colors
# حاجز (Hajiz) — Admin Dashboard Project Brief

## What is Hajiz?
A multi-domain booking platform that connects customers with local service providers
(barbers, clinics, car repair shops, gyms, salons, restaurants, etc.)

## Business Model
- Customers use the mobile app (Flutter) to discover and book services
- Business owners manage their shop via the mobile app
- Platform takes 5% commission on each completed booking
- Admin controls everything via this web dashboard

## Three Parts of the System
1. **Customer Mobile App** — Flutter (iOS + Android)
2. **Business Owner Mobile App** — Flutter (same app, different screens)
3. **Admin Dashboard** — This Vue.js web app

## Admin Dashboard Tech Stack
- Framework: Vue.js 3 + TypeScript
- State: Pinia
- Router: Vue Router 4
- HTTP: Axios
- Styling: Tailwind CSS
- Charts: Chart.js + vue-chartjs
- Icons: @heroicons/vue
- Notifications: vue-toastification

## Backend API
- Base URL: https://hajez-backend-new-production.up.railway.app/api
- Auth: Bearer token (stored in localStorage as 'hajiz_admin_token')
- All admin routes start with /admin/

## Admin Capabilities
- View overall platform statistics
- Approve or suspend business registrations
- Manage all customers (view, block, unblock)
- View all bookings across all businesses
- Manage service categories (add, edit, delete)
- Track platform revenue and commissions
- Send push notifications to customers or businesses
- Generate reports (bookings, revenue, categories)

## Pages / Routes
| Route | Page | Description |
|-------|------|-------------|
| /login | Login | Admin authentication |
| /dashboard | Dashboard | Overview stats + charts |
| /businesses | Businesses List | All businesses + filter/approve/suspend |
| /businesses/:id | Business Detail | Full business info + actions |
| /customers | Customers List | All customers |
| /customers/:id | Customer Detail | Customer bookings + block |
| /bookings | All Bookings | Platform-wide bookings + filter |
| /categories | Categories | Manage service categories |
| /revenue | Revenue | Commission tracking + charts |
| /notifications | Notifications | Send + view notifications |
| /reports | Reports | Booking, business, category reports |

## Color Scheme
- Primary (Purple): #6C63FF
- Success (Green): #10B981
- Danger (Red): #EF4444
- Warning (Yellow): #F59E0B

## Language
All UI text is in Arabic (RTL layout).

## Future Roadmap
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced analytics with date comparisons
- [ ] Export reports to Excel/PDF
- [ ] Multi-admin roles (super admin / moderator)
- [ ] Dark mode
- [ ] Business performance scoring

## Commission Logic
- Rate: 5% of each completed booking's total price
- Tracked automatically by backend
- Displayed in revenue and reports pages

## Status Values
### Business Status
- `pending` — just registered, awaiting admin approval
- `active` — approved and visible to customers
- `suspended` — temporarily disabled by admin

### Booking Status
- `pending` — customer booked, waiting business confirmation
- `confirmed` — business confirmed the booking
- `completed` — service delivered
- `cancelled` — cancelled by customer or admin

## Known Issues / TODO
- Add pagination to all list views
- Add export CSV functionality to bookings table
- Add date range filters to more reports
