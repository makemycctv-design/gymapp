# FitZone Gym Management Platform

Multi-branch gym management with React frontend + Node.js/Express backend.

## Live: https://fitness.nokkoo.in

## Stack
- **Frontend:** React 18, Vite, Tailwind CSS, TypeScript
- **Backend:** Node.js, Express, Prisma ORM, PostgreSQL
- **Auth:** JWT, bcrypt, role-based access
- **PWA:** Installable, offline support

## Deployment (VPS)
```bash
# Backend
cd backend && npm install && npx prisma generate && npx prisma migrate deploy && npm run build
pm2 start dist/index.js --name gymapp-api

# Frontend
cd frontend && npm install && npx vite build
# Nginx serves frontend/dist
```

## Logins
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fitness.nokkoo.in | Admin@123! |
| Manager | manager@fitness.nokkoo.in | Manager@123! |
| Trainer | trainer@fitness.nokkoo.in | Trainer@123! |
