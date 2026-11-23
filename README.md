# JobMatch AI 🚀
### Intelligent Job Recruitment and AI-Powered Skill Matching Platform

JobMatch AI is a full-stack, enterprise-grade recruitment platform designed to intelligently connect candidates and hiring managers using transparent, explainable skill matching, automated PDF resume parsing, real-time application tracking, and analytics dashboards.

---

## 🌟 Key Highlights & Modules

### 1. Candidate Module
- **Authentication & Profiles**: Secure JWT authentication (login/register/refresh) with role-based permissions (`CANDIDATE`).
- **Profile Management**: Education, work experience, location, summary, headline, social links (GitHub, LinkedIn).
- **PDF Resume Intelligence**: Direct PDF upload via PyMuPDF with text extraction and automatic technical skill discovery.
- **Skill Verification**: Review and edit AI-extracted technical skills with proficiency levels (Beginner, Intermediate, Advanced, Expert).
- **Job Discovery & Search**: Filter jobs by title, company, location, employment type (Full-time, Part-time, Remote, Contract, Internship), and required skills.
- **AI Matching Breakdown**: View real-time match percentage, matched skills, and missing skill gap analysis for every job before applying.
- **Application Funnel**: Apply with custom cover letters and chosen resumes, avoid duplicate applications, track application status (Applied, Under Review, Shortlisted, Interview, Selected, Rejected), and withdraw applications.
- **Saved Jobs**: Bookmark jobs to review and apply later.
- **Candidate Dashboard**: Profile completion progress meter, metrics cards, recent application history, and personalized job recommendations.

### 2. Recruiter Module
- **Company Profile**: Manage company name, industry, size, location, website, and company logo.
- **Job Posting & Management**: Publish, edit, and close job postings with detailed responsibilities, qualifications, salary ranges, deadlines, and required skills with customized importance weights (1-5) and mandatory tags.
- **Applicant Management**: View all candidates applied to postings, automatically sorted by AI match percentage descending.
- **Candidate Inspection**: View full candidate profile, qualifications, and download uploaded resumes.
- **Decision Workflow**: Update applicant statuses (Under Review, Shortlisted, Interview, Selected, Rejected) with instant automated notifications sent to candidates.
- **Recruiter Dashboard**: Visual recruitment analytics including Recharts bar charts for top job postings and application status distribution.

### 3. AI & NLP Skill Matching Engine
- **Explainable Weighted Scoring**:
  - Technical skills: 60%
  - Experience level: 20%
  - Education match: 10%
  - Additional relevant skills: 10%
- **Mandatory Skill Guard**: Failure to meet recruiter-flagged mandatory skills caps the maximum achievable score to maintain recruitment integrity.
- **Pluggable NLP Cosine Similarity**: Scikit-Learn TF-IDF vectorizer computes semantic cosine similarity between resume text and job descriptions.
- **Skill Dictionary**: Pre-seeded comprehensive taxonomy supporting 100+ technologies, frameworks, and aliases (e.g. Python, React, Django, Docker, Kubernetes, MySQL, AWS, PyTorch).

### 4. Administrator Module
- **Admin Dashboard**: System-wide statistics covering user counts, job statistics, 30-day registration velocity, and in-demand skill distribution.
- **User Moderation**: Filter candidates and recruiters, search by email/name, and toggle account activation.
- **Job Moderation**: Review all platform job postings, toggle active/closed state, and delete non-compliant listings.

### 5. In-App Notifications
- Real-time milestone updates for candidates (Application Submitted, Shortlisted, Rejected, Status Updated).
- Instant recruiter notifications when a candidate applies.
- Unread count badge and one-click "Mark All as Read" workflow.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router v7, Axios, Lucide React, Recharts |
| **Backend** | Python 3.12, Django 6.1 / 5.2, Django REST Framework, SimpleJWT, django-cors-headers |
| **Database** | MySQL 8.0 with Django ORM |
| **AI / NLP** | PyMuPDF (fitz) for PDF extraction, Scikit-learn (TF-IDF & Cosine Similarity) |
| **Deployment** | Vercel (Frontend & Serverless Backend), Git & GitHub |

---

## 📁 Project Architecture

```
JobMatchAI/
├── backend/
│   ├── apps/
│   │   ├── accounts/         # Custom User model, JWT authentication, roles
│   │   ├── candidates/       # CandidateProfile, Skills, Education, Experience, Resumes
│   │   ├── recruiters/       # Company, RecruiterProfile
│   │   ├── jobs/             # JobPost, JobRequiredSkill, JobApplication, SavedJob
│   │   ├── matching/         # AI matcher, NLP TF-IDF cosine similarity, PDF parser
│   │   ├── notifications/    # In-app notification system & helpers
│   │   └── analytics/        # Candidate, Recruiter, and Admin analytics endpoints
│   ├── config/               # Settings, WSGI/ASGI, root URLs
│   ├── media/                # Uploaded resumes and company logos
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   └── vercel.json
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios instance with JWT interceptors
│   │   ├── components/       # Navbar, ProtectedRoute, SkillBadge
│   │   ├── context/          # AuthContext (state & tokens)
│   │   ├── pages/
│   │   │   ├── auth/         # Login, Register
│   │   │   ├── candidate/    # Dashboard, Profile, JobSearch, JobDetail, Applications, SavedJobs, Resumes, Settings
│   │   │   ├── recruiter/    # Dashboard, CompanyProfile, PostJob, ManageJobs, Applicants, Settings
│   │   │   ├── admin/        # Dashboard, Users, Jobs
│   │   │   ├── notifications/# NotificationsPage
│   │   │   └── LandingPage.jsx
│   │   ├── App.jsx           # Client-side router configuration
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── .env.example
│   └── vercel.json
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Local Setup

### Prerequisites
- Python 3.12+
- Node.js 20+ and npm
- MySQL Server 8.0+

### 1. Database Setup
Log into your MySQL client and create the database:
```sql
CREATE DATABASE jobmatch_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv ../venv
# Windows PowerShell:
..\venv\Scripts\Activate.ps1
# macOS/Linux:
source ../venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your MySQL credentials (DB_NAME, DB_USER, DB_PASSWORD)

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Seed predefined technical skills
python manage.py seed_skills

# Create superuser / platform administrator
python manage.py createsuperuser

# Start Django backend server
python manage.py runserver
```
The API backend will be available at `http://127.0.0.1:8000/`.

### 3. Frontend Setup
In a new terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install node dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start Vite development server
npm run dev
```
The web application will be live at `http://localhost:5173/`.

---

## 🔌 API Reference Overview

### Authentication (`/api/auth/`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register/` | Register candidate or recruiter | Public |
| `POST` | `/api/auth/login/` | Obtain JWT access and refresh tokens | Public |
| `POST` | `/api/auth/token/refresh/` | Refresh JWT access token | Public |
| `GET` | `/api/auth/me/` | Fetch current user info | Authenticated |
| `POST` | `/api/auth/change-password/` | Update user password | Authenticated |

### Jobs & Applications (`/api/jobs/`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/jobs/` | Search & filter active jobs | Public |
| `POST` | `/api/jobs/` | Create a job posting with skill weights | Recruiter |
| `GET` | `/api/jobs/<id>/detail/` | View job details + candidate match preview | Public / Candidate |
| `POST` | `/api/jobs/<id>/apply/` | Submit application with AI score capture | Candidate |
| `POST` | `/api/jobs/<id>/save/` | Toggle save/unsave bookmark | Candidate |
| `GET` | `/api/jobs/saved/` | List saved jobs | Candidate |
| `GET` | `/api/jobs/my-applications/` | List own submitted applications | Candidate |
| `DELETE` | `/api/jobs/applications/<id>/withdraw/` | Withdraw pending application | Candidate |
| `GET` | `/api/jobs/my-postings/` | List jobs posted by recruiter | Recruiter |
| `GET` | `/api/jobs/<id>/applicants/` | View applicants ranked by AI match score | Recruiter (Owner) |
| `PATCH` | `/api/jobs/applications/<id>/status/` | Update application status | Recruiter (Owner) |

### Resumes & Candidates (`/api/candidates/`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET/PUT` | `/api/candidates/profile/me/` | Candidate profile details | Candidate |
| `POST` | `/api/candidates/resumes/upload/` | Upload PDF & extract skills via PyMuPDF | Candidate |
| `GET` | `/api/candidates/resumes/` | List uploaded resumes | Candidate |
| `DELETE` | `/api/candidates/resumes/<id>/` | Delete uploaded resume | Candidate |
| `GET/POST`| `/api/candidates/skills/` | Manage candidate profile skills | Candidate |
| `GET/POST`| `/api/candidates/education/` | Manage education history | Candidate |
| `GET/POST`| `/api/candidates/experience/`| Manage work experience entries | Candidate |

### Analytics & Admin (`/api/analytics/`, `/api/admin/`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/analytics/candidate/` | Candidate funnel metrics & recommendations | Candidate |
| `GET` | `/api/analytics/recruiter/` | Recruiter applicant analytics & charts | Recruiter |
| `GET` | `/api/analytics/admin/` | Platform-wide growth & top skills metrics | Admin |
| `GET` | `/api/admin/users/` | List and search all platform accounts | Admin |
| `PATCH`| `/api/admin/users/<id>/toggle-active/` | Activate or deactivate a user account | Admin |
| `GET` | `/api/admin/jobs/` | List and search all platform jobs | Admin |
| `PATCH`| `/api/admin/jobs/<id>/toggle-status/` | Toggle job status (ACTIVE / CLOSED) | Admin |
| `DELETE`| `/api/admin/jobs/<id>/` | Permanently delete job posting | Admin |

### Notifications (`/api/notifications/`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/notifications/` | Paginated list of notifications | Authenticated |
| `GET` | `/api/notifications/unread-count/` | Unread notifications badge count | Authenticated |
| `POST`| `/api/notifications/<id>/read/` | Mark single notification as read | Authenticated |
| `POST`| `/api/notifications/read-all/` | Mark all user notifications as read | Authenticated |

---

## 🚀 Deployment Guide (Vercel)

### Frontend Deployment
1. Connect the GitHub repository to [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Environment Variables:
   - `VITE_API_BASE_URL`: URL of your deployed Django backend (e.g. `https://api.yourdomain.com/api`).

### Backend Deployment
1. Configure a production MySQL database (such as AWS RDS, PlanetScale, or Aiven MySQL).
2. Configure cloud file storage (e.g., AWS S3 via `django-storages`) for persistent resumes.
3. In Vercel, set Root Directory to `backend`.
4. Configure environment variables in Vercel:
   - `DEBUG=False`
   - `SECRET_KEY=your-production-secret-key`
   - `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
   - `ALLOWED_HOSTS=.vercel.app,yourdomain.com`
   - `CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app`

---

## 📄 License
This project is licensed under the MIT License - open for educational, personal, and commercial portfolio use.
