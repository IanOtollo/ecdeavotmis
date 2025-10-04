ECDEAVOTMIS

Education & Vocational Training Management Information System

A web-based system for managing Early Childhood Development Education (ECDE) centers and Vocational Training institutions. The system allows institutions to register, manage learners/students, track infrastructure, emergency reports, financial records, and generate reports.

Features
🔹 Institution Management

Register & manage institutions

Capture bio-data (type, level, county, ward, education system, ownership, KRA pin, etc.)

Upload supporting documents (certificates, ownership docs, compliance docs)

Manage infrastructure, bank accounts, capitation receipts, and school books

🔹 Learners (ECDE & Vocational)

Register learners/students with UPI auto-generation

Capture personal info (first name, last name, other names, gender, DOB, photo)

Record admission details

View, search, update, and release learners

Generate reports on admissions, learners per institution, and UPI lists

🔹 Emergency Reporting

Submit and track calamity reports per institution

Capture incident type, date, description, response, and status

🔹 Reports & Export

Admission reports

UPI lists

Learner data export (CSV/Excel)

Institution statistics

🔹 Utilities

Admin/User login & authentication

Change password

Logout

Tech Stack

Frontend: React + TypeScript + TailwindCSS + ShadCN UI

Backend: Node.js / Express (API endpoints)

Database: Supabase (PostgreSQL)

Deployment: Vercel

Getting Started
Prerequisites

Node.js (v18+) & npm

Supabase account (for database)

Vercel account (for deployment)

Setup
# Clone repository
git clone <YOUR_GIT_URL>
cd ecdeavotmis

# Install dependencies
npm install

# Create an .env file and add your Supabase keys
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Start development server
npm run dev


The app will be available at http://localhost:5173 //or the available localhost set by your local PC environment 
.

Deployment

Push your repo to GitHub

Link it with Vercel

Set the environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) in Vercel dashboard

Deploy 

Author

Developed by Ian Otollo.
