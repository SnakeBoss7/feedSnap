# FeedSnap

**AI-Powered Feedback Management Platform for Modern Websites**

FeedSnap is a comprehensive feedback collection and analysis platform that enables website owners to embed a customizable widget, collect user feedback, analyze sentiment with AI, and manage team responses - all from a unified dashboard.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Widget Integration](#widget-integration)
- [Pages Overview](#pages-overview)
- [API Endpoints](#api-endpoints)
- [RBAC (Role-Based Access Control)](#rbac-role-based-access-control)
- [Severity Calculation](#severity-calculation)
- [Live Demo](#live-demo)
- [Screenshots](#screenshots)
- [Future Roadmap](#future-roadmap)
- [Author](#author)

---

## Features

### Dashboard
- Overview metrics: average rating, today's new feedback count, total weekly feedback
- Likes/engagement statistics
- Word cloud visualization (updated weekly) showing positive and negative sentiment keywords
- Quick access to recent feedback entries

### Script Generator
- Live preview of the feedback widget
- Customizable widget positioning (top-left, top-right, bottom-left, bottom-right)
- Color theme customization
- Text and styling options
- Widget includes:
  - Feedback form with rating system
  - AI-powered chat assistant (context-aware based on bot configuration)
- Optional acknowledgment email feature - automatically sends confirmation email when users submit feedback

### Team Management (RBAC)
- Invite team members via email
- Three role levels:
  - **Admin**: Full access - add websites, manage members, view/export feedback, configure settings
  - **Editor**: Add websites, view/export feedback, delete data
  - **Viewer**: Read-only access to assigned feedback and analytics

### Analytics
- Multiple visualization charts:
  - Bar charts for feedback trends
  - Line graphs for time-based analysis
  - Pie charts for category distribution
  - Additional statistical graphs
- Filters:
  - Time frame selection (daily, weekly, monthly, custom range)
  - Website selector (individual or all websites)
  - Category filters

### Feedback Management
- Comprehensive feedback table with sorting and filtering
- Filter by severity level (calculated automatically)
- Filter by feedback type (Bug Report, Improvement, General Feedback, Feature Request, Complaint)
- Filter by rating
- AI Chatbot sidebar:
  - Access to all feedback data
  - Consulting assistance for feedback analysis
  - Generate professional email responses
  - Direct email sending to team members

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React.js | Dynamic UI with modern component architecture |
| Backend | Node.js + Express.js | REST API server |
| Database | MongoDB (Mongoose) | Data persistence for users, websites, feedback |
| Authentication | Firebase Auth + JWT | Secure user authentication and session management |
| AI Services | NVIDIA API | AI chat assistant and content generation |
| Email Service | MailerSend | Transactional emails and acknowledgment messages |
| Charts | Chart.js / Recharts | Analytics visualization |
| Deployment | Vercel (frontend) + Render (backend) | Production hosting |

---

## Project Structure

```
FeedSnap/
|
|-- client/                     # React Frontend
|   |-- src/
|       |-- components/
|       |   |-- PageComponents/     # Page-specific components
|       |   |   |-- Landing/        # Landing page components
|       |   |   |-- ScripGen/       # Script generator components
|       |   |   |-- feedback/       # Feedback management components
|       |   |   |-- teams/          # Team management components
|       |   |-- newCharts/          # Chart components and utilities
|       |   |-- ui/                 # Reusable UI components
|       |   |-- header/             # Header components
|       |   |-- sidebar/            # Sidebar navigation
|       |-- pages/
|       |   |-- dashboard/
|       |   |   |-- outlets/
|       |   |       |-- dashboard.jsx   # Main dashboard
|       |   |       |-- analytics.jsx   # Analytics page
|       |   |       |-- feedback.jsx    # Feedback management
|       |   |       |-- teams.jsx       # Team management
|       |   |       |-- scriptGen.jsx   # Script generator
|       |   |-- landing/            # Landing page
|       |   |-- login/              # Authentication pages
|       |-- context/                # React context providers
|       |-- services/               # API service functions
|       |-- utils/                  # Utility functions
|
|-- server/                     # Express Backend
|   |-- controllers/
|   |   |-- authController.js       # Authentication logic
|   |   |-- feebackController.js    # Feedback CRUD operations
|   |   |-- llmController.js        # AI/LLM integration
|   |   |-- teamController.js       # Team management
|   |   |-- scriptController.js     # Widget script generation
|   |   |-- widgetController.js     # Widget serving
|   |-- models/
|   |   |-- user.js                 # User schema
|   |   |-- WebData.js              # Website data schema
|   |   |-- feedback.js             # Feedback schema
|   |   |-- teamSchema.js           # Team schema
|   |-- routes/                 # API route definitions
|   |-- middleware/             # Auth and validation middleware
|   |-- utils/
|   |   |-- severityCompute.js      # Severity calculation algorithm
|   |   |-- ackMails.js             # Acknowledgment email handler
|   |   |-- jwtTokenGen.js          # JWT token generation
|   |-- public/                 # Static files and widget assets
|   |-- widgets/                # Widget templates
|   |-- config/                 # Database and Firebase config
|
|-- README.md
```

---

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB instance (local or Atlas)
- Firebase account (for authentication)
- MailerSend account (for email functionality)
- NVIDIA API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SnakeBoss7/feedSnap.git
   cd feedsnap
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables** (see [Environment Variables](#environment-variables))

5. **Run the development servers**
   ```bash
   # Terminal 1 - Server
   cd server
   npm start

   # Terminal 2 - Client
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:5000`

---

## Environment Variables

### Server (`server/.env`)

```bash
# Database
MONGO_URL=your_mongodb_connection_string

# URLs
SERVER=http://localhost:5000
FRONTEND=http://localhost:3000
NODE_ENV=development

# Authentication
JWT_SECRET=your_jwt_secret_key

# AI Services
NVIDIA_API_KEY=your_nvidia_api_key
TOGETHER_API_KEY=your_together_api_key           # Optional
OPENROUTER_API_KEY=your_openrouter_api_key       # Optional
OPENROUTER_API_KEY1=your_backup_openrouter_key   # Optional

# Email Service
EMAIL=your_sender_email
MAILERSEND_API_KEY=your_mailersend_api_key
MAILERSEND_DOMAIN=your_mailersend_domain
```

### Client (`client/.env`)

```bash
REACT_APP_API_URL=http://localhost:5000
REACT_APP_API_FRONTEND_URL=http://localhost:3000
REACT_APP_FIREBASE_API=your_firebase_api_key
REACT_APP_MODE=dev
```

---

## Widget Integration

Embed FeedSnap on any website with a single script tag. Add this before the closing `</body>` tag:

```html
<script src="https://feedsnap.onrender.com/widget/script?webUrl=YOUR_WEBSITE_URL"></script>
```

The widget provides:
- Feedback submission form with star rating
- Category selection (Bug Report, Improvement, Feature Request, General Feedback, Complaint)
- Optional email field
- AI-powered chat assistant for user queries

---

## Pages Overview

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Public landing page with product information |
| Login | `/login` | Authentication (Firebase) |
| Dashboard | `/dashboard` | Overview metrics, word cloud, recent activity |
| Script Generator | `/dashboard/script` | Widget customization and code generation |
| Teams | `/dashboard/teams` | Team member management with RBAC |
| Analytics | `/dashboard/analytics` | Charts and data visualization |
| Feedback | `/dashboard/feedback` | Feedback table with AI assistant |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/verify` | Verify JWT token |

### Feedback
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feedback` | Get all feedback (with filters) |
| POST | `/api/feedback` | Submit new feedback |
| PUT | `/api/feedback/:id` | Update feedback status |
| DELETE | `/api/feedback/:id` | Delete feedback |

### Teams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/team` | Get team members |
| POST | `/api/team/invite` | Invite team member |
| PUT | `/api/team/:id/role` | Update member role |
| DELETE | `/api/team/:id` | Remove team member |

### AI/LLM
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/llm/chat` | AI chat completion |
| POST | `/api/llm/generate-email` | Generate email content |

### Widget
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/widget/script` | Get widget script |

---

## RBAC (Role-Based Access Control)

| Permission | Admin | Editor | Viewer |
|------------|-------|--------|--------|
| Add websites | Yes | Yes | No |
| View feedback | Yes | Yes | Yes |
| Export feedback | Yes | Yes | No |
| Delete data | Yes | Yes | No |
| Manage team members | Yes | No | No |
| Change configurations | Yes | No | No |
| Access analytics | Yes | Yes | Yes (read-only) |

---

## Severity Calculation

Feedback severity (1-10 scale) is automatically computed based on multiple factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| Feedback Type | 5-35 points | Bug reports weighted highest, general feedback lowest |
| Rating | 0-40 points | Lower ratings increase severity (inverted scale) |
| Keywords | 0-50 points | Security/critical terms boost severity |
| Description Length | 0-10 points | Longer descriptions may indicate complex issues |
| User Contact | 0-8 points | Email provided and open status add weight |

The algorithm analyzes for critical keywords including: vulnerability, crash, exploit, SQL injection, XSS, data leak, privilege escalation, and more.

---

## Live Demo

| Resource | URL |
|----------|-----|
| Frontend | [https://feed-snap-nine.vercel.app](https://feed-snap-nine.vercel.app) |
| Backend | [https://feedsnap.onrender.com](https://feedsnap.onrender.com) |

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Member | demo@mail.com | 123 |

---

## Screenshots

| Feature | Preview |
|---------|---------|
| Landing Page | ![Landing](https://res.cloudinary.com/dnlea05ys/image/upload/v1762328001/Screenshot_from_2025-11-05_10-58-38_tctkns.png) |
| Dashboard | ![Dashboard](https://res.cloudinary.com/dnlea05ys/image/upload/v1762327999/Screenshot_from_2025-11-05_10-56-54_dgkjeo.png) |
| Feedback Table | ![Feedback](https://res.cloudinary.com/dnlea05ys/image/upload/v1762327996/Screenshot_from_2025-11-05_10-50-48_uwwgux.png) |
| Email Generation | ![Mail Gen](https://res.cloudinary.com/dnlea05ys/image/upload/v1762327997/Screenshot_from_2025-11-05_10-55-40_nja52r.png) |
| Analytics | ![Analytics](https://res.cloudinary.com/dnlea05ys/image/upload/v1762327996/Screenshot_from_2025-11-05_10-56-37_wawgjw.png) |
| Script Generator | ![Generator](https://res.cloudinary.com/dnlea05ys/image/upload/v1762327997/Screenshot_from_2025-11-05_10-56-59_dvhwlx.png) |
| Widget - Feedback Form | ![Feedback Form](https://res.cloudinary.com/dnlea05ys/image/upload/v1762327998/Screenshot_from_2025-11-05_10-57-08_azxmkx.png) |
| Widget - AI Chatbot | ![Chatbot](https://res.cloudinary.com/dnlea05ys/image/upload/v1762328001/Screenshot_from_2025-11-05_10-57-41_fm3jd3.png) |
| Generated Email Preview | ![Email Preview](https://res.cloudinary.com/dnlea05ys/image/upload/v1762327994/Screenshot_from_2025-11-05_10-56-08_vbivcy.png) |

---

## Architecture

```
                    +------------------+
                    |   React Client   |
                    |    (Vercel)      |
                    +--------+---------+
                             |
                    +--------v---------+
                    |  Express Server  |
                    |    (Render)      |
                    +--------+---------+
                             |
        +--------------------+--------------------+
        |                    |                    |
+-------v-------+   +--------v--------+   +-------v-------+
|   MongoDB     |   |  Firebase Auth  |   |  External APIs|
|   Database    |   |  (Validation)   |   |  - NVIDIA AI  |
|               |   |                 |   |  - MailerSend |
+---------------+   +-----------------+   +---------------+
```

---

## Future Roadmap

- Pagination for large feedback datasets
- Rate limiting for API protection
- Redis caching (currently using 5-minute localStorage cache)

---

## Author

**Rahul**  
BCA Student | Full Stack Developer

- Email: rahuldharwal12005@gmail.com
- GitHub: [SnakeBoss7](https://github.com/SnakeBoss7)


---

**Built for better user feedback management**