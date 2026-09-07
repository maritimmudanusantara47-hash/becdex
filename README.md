# BECdex (Blue Economy Company Index) 🌊

[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**BECdex (Blue Economy Company Index)** is a comprehensive web-based platform developed for **Maritim Muda Nusantara**. It serves as an official certification portal for maritime companies to undergo self-assessment, independent evaluation, and third-party certification against the National Blue Economy principles.

---

## 📖 Table of Contents
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#-environment-variables)
- [Role-Based Access Control](#-role-based-access-control)
- [Payment Gateway Integration](#-payment-gateway-integration)

---

## ✨ Features

- **Dynamic Questionnaire Framework:** Administrators can build and manage complex hierarchical assessments (Aspects → Outcomes → Principles → Indicators → Questions).
- **Certification Workflow:** A complete end-to-end flow for companies: Draft → Submit → Assessment (by Reviewers/Supervisors) → Field Survey → Payment → Certificate Issuance.
- **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for Companies, Assessors (Reviewer & Supervisor), and Admins (Manager & Super Admin).
- **Payment Gateway Integration:** Seamless payment flow using **Xendit** to handle certification administration fees (Virtual Accounts, E-Wallets, Credit Cards).
- **Dynamic Certificate Designer:** Built-in PDF generator with a visual coordinate designer to place dynamic text (Name, Score, Dates, QR Codes) on top of custom certificate backgrounds.
- **Multilingual Support:** Seamless switching between Indonesian (ID) and English (EN) using a custom lightweight translation engine via Zustand.
- **Public Verification Portal:** Public users can verify the authenticity of a company's certificate via QR code and view the directory of certified maritime companies.

---

## 🏗 Architecture

The repository is structured as a monorepo consisting of two decoupled applications:

```text
becdex/
├── Backend/      # Laravel 11 RESTful API
└── Frontend/     # Next.js 16 Web Application (SPA/SSR)
```
The Backend operates as a stateless JSON API, authenticated via **Laravel Sanctum (Cookie-based SPA Authentication)**, providing robust CSRF protection without the need for manual token management in the frontend.

---

## 💻 Tech Stack

### Backend (API)
* **Framework:** Laravel 11 (PHP 8.2+)
* **Database:** MySQL
* **Authentication:** Laravel Sanctum (SPA Cookies)
* **PDF Generation:** `barryvdh/laravel-dompdf`
* **Payment Gateway:** `xendit/xendit-php`
* **Testing:** Pest / PHPUnit (Feature & Unit Tests)

### Frontend (Client)
* **Framework:** Next.js 16 (App Router)
* **Library:** React 19
* **Language:** TypeScript
* **Styling:** Tailwind CSS & Framer Motion (Animations)
* **State Management:** Zustand
* **Data Fetching:** TanStack Query (React Query) v5 & Axios
* **Form Validation:** React Hook Form + Zod
* **Testing:** Vitest & React Testing Library

---

## 🚀 Getting Started

### Prerequisites
* PHP 8.2+ and Composer
* Node.js 20+ and npm/yarn/pnpm
* MySQL / MariaDB

### Backend Setup
1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```
2. Install PHP dependencies:
   ```bash
   composer install
   ```
3. Copy the environment file and generate the application key:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
4. Configure your database connection in the `.env` file, then run migrations and seeders (Crucial for RBAC and Master Data):
   ```bash
   php artisan migrate --seed
   ```
5. Serve the API (Typically runs on `http://localhost:8000`):
   ```bash
   php artisan serve
   ```

### Frontend Setup
1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Copy the environment file:
   ```bash
   cp .env.example .env.local
   ```
4. Start the development server (Typically runs on `http://localhost:3000`):
   ```bash
   npm run dev
   ```

---

## 🔐 Role-Based Access Control

The system utilizes a centralized `RoleId` Enum to handle permissions.
* `SuperAdmin` (1): Full system access, including system settings.
* `Company` (2): Can fill out questionnaires, upload documents, and track certification status.
* `Reviewer` (6): Assessors who verify the submitted documents.
* `Supervisor` (7): Senior assessors who double-check the reviewer's score.
* `Manager` (10): Admin staff who assign assessors, schedule surveys, and issue the final certificates.

---

## 💳 Payment Gateway Integration

BECdex uses **Xendit** to process certification fees automatically.
* Invoices are generated when a submission passes the document verification stage.
* The system listens to Xendit Webhooks (Invoice Paid, Expired) to automatically progress the company's submission status.
* When testing locally, you can use [ngrok](https://ngrok.com/) or the Xendit Dashboard test mode to simulate webhooks hitting the `/api/payment/webhook` endpoint.

---
*Developed with ❤️ for the sustainable future of the Blue Economy.*
