# SponzoBD - Project Overview

## 📋 Project Description

**SponzoBD** is Bangladesh's premier sponsorship matching platform that connects **Sponsors** (companies/brands) with **Sponsees** (event organizers, micro-influencers, content creators). The platform facilitates meaningful partnerships by providing tools for discovery, communication, document sharing, and sponsorship management.

### Core Value Proposition

- **For Sponsors**: Discover verified events and influencers to sponsor, manage sponsorship portfolios, track ROI
- **For Sponsees/Micro-Influencers**: Find sponsors for events/content, showcase portfolios, manage sponsorship requests

---

## 🛠️ Technology Stack

### Frontend

| Technology                   | Purpose                           |
| ---------------------------- | --------------------------------- |
| **HTML5**                    | Page structure                    |
| **Tailwind CSS**             | Utility-first styling             |
| **JavaScript (Vanilla)**     | Client-side logic                 |
| **Font Awesome**             | Icons                             |
| **AOS (Animate on Scroll)**  | Scroll animations                 |
| **Google Fonts**             | Typography (Inter, Space Grotesk) |
| **Google Identity Services** | Social authentication             |

### Backend

| Technology     | Version | Purpose               |
| -------------- | ------- | --------------------- |
| **Node.js**    | v14+    | Runtime environment   |
| **Express.js** | 4.18.2  | Web framework         |
| **MongoDB**    | -       | NoSQL database        |
| **Mongoose**   | 7.0.0   | ODM for MongoDB       |
| **JWT**        | 9.0.0   | Authentication tokens |
| **bcryptjs**   | 2.4.3   | Password hashing      |
| **CORS**       | 2.8.5   | Cross-origin requests |
| **dotenv**     | 16.0.3  | Environment variables |

### Deployment

| Service           | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| **Vercel**        | Frontend hosting (https://sponzobd.vercel.app)   |
| **Render**        | Backend hosting (https://test-6aiv.onrender.com) |
| **MongoDB Atlas** | Cloud database                                   |

---

## 🎯 Features

### 1. **Authentication System**

- Email/Password registration and login
- Google OAuth integration
- Facebook OAuth (coming soon)
- JWT-based session management
- Password reset with email verification
- Remember me functionality
- Dual user types (Sponsor/Sponsee)

### 2. **User Profiles**

- **Sponsor Profile**: Company info, industry, budget, focus areas, logo, cover photo
- **Sponsee Profile**: Event/Influencer info, organization, expected reach, categories
- Profile completion progress tracking
- Social media links (LinkedIn, Twitter, Facebook, Instagram)
- Profile picture and cover photo upload

### 3. **Discovery & Browsing**

- Browse sponsors (for sponsees)
- Browse events/sponsees (for sponsors)
- Category-based filtering
- Search functionality

### 4. **Messaging System**

- Real-time conversations between sponsors and sponsees
- Message read receipts
- Conversation history
- Unread message count

### 5. **Document Management**

- Upload documents (proposals, contracts, invoices, reports)
- Document categorization
- Public/private sharing options
- Share documents with specific users
- Download tracking

### 6. **Dashboard**

- **Sponsor Dashboard**: Active sponsorships, pending requests, total invested, recent activity
- **Sponsee Dashboard**: Sponsorship requests, active sponsors, budget tracking

---

## 📊 Database Model Architecture

### UML Class Diagram (Mermaid)

```mermaid
classDiagram
    class Sponsor {
        +ObjectId _id
        +String companyName
        +String email
        +String password
        +String phone
        +String contactPerson
        +String industry
        +String location
        +String description
        +Number budget
        +String[] focusAreas
        +String website
        +String logo
        +String coverPhoto
        +Boolean isVerified
        +SocialAuth socialAuth
        +SocialLinks socialLinks
        +Date createdAt
        +comparePassword(password)
        +getProfileCompletion()
    }

    class Sponsee {
        +ObjectId _id
        +String eventName
        +String email
        +String password
        +String contactPerson
        +String phone
        +String organization
        +String location
        +String description
        +Number expectedAttendees
        +String[] eventType
        +String[] categories
        +Number budget
        +String website
        +String logo
        +String coverPhoto
        +Boolean isVerified
        +SocialAuth socialAuth
        +SocialLinks socialLinks
        +Date createdAt
        +comparePassword(password)
        +getProfileCompletion()
    }

    class Message {
        +ObjectId _id
        +String conversationId
        +Sender sender
        +Receiver receiver
        +String content
        +Boolean read
        +Date readAt
        +Date createdAt
        +createConversationId(id1, id2)
    }

    class Document {
        +ObjectId _id
        +Owner owner
        +String title
        +String description
        +String fileName
        +String fileType
        +Number fileSize
        +String fileData
        +String category
        +Boolean isPublic
        +SharedWith[] sharedWith
        +Number downloads
        +Date createdAt
    }

    class SocialAuth {
        +GoogleAuth google
        +FacebookAuth facebook
    }

    class SocialLinks {
        +String linkedin
        +String twitter
        +String facebook
        +String instagram
    }

    class Owner {
        +ObjectId id
        +String role
        +String name
    }

    class Sender {
        +ObjectId id
        +String role
        +String name
    }

    class Receiver {
        +ObjectId id
        +String role
        +String name
    }

    Sponsor "1" --> "0..*" Message : sends/receives
    Sponsee "1" --> "0..*" Message : sends/receives
    Sponsor "1" --> "0..*" Document : owns
    Sponsee "1" --> "0..*" Document : owns
    Sponsor "1" --> "1" SocialAuth : has
    Sponsee "1" --> "1" SocialAuth : has
    Sponsor "1" --> "1" SocialLinks : has
    Sponsee "1" --> "1" SocialLinks : has
    Document "1" --> "1" Owner : belongs to
    Message "1" --> "1" Sender : from
    Message "1" --> "1" Receiver : to
```

---

## 🔄 Data Flow Diagram

### UML Sequence Diagram - User Registration Flow

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (Vercel)
    participant B as Backend (Render)
    participant DB as MongoDB Atlas

    U->>F: Fill registration form
    F->>F: Validate form inputs
    F->>B: POST /api/auth/sponsor/register or /sponsee/register
    B->>B: Validate request body
    B->>B: Hash password (bcrypt)
    B->>DB: Check if email exists
    DB-->>B: Email availability
    alt Email exists
        B-->>F: 400 Error - Email in use
        F-->>U: Show error message
    else Email available
        B->>DB: Create new user document
        DB-->>B: User created
        B->>B: Generate JWT token
        B-->>F: 201 Success + token + user data
        F->>F: Store token in localStorage
        F-->>U: Redirect to profile page
    end
```

### UML Sequence Diagram - Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB

    U->>F: Enter credentials
    F->>B: POST /api/auth/sponsor/login
    B->>DB: Find user by email
    DB-->>B: User document (with hashed password)
    B->>B: Compare passwords (bcrypt)
    alt Password matches
        B->>B: Generate JWT (7 days expiry)
        B-->>F: 200 OK + token + user data
        F->>F: localStorage.setItem('authToken', token)
        F-->>U: Redirect to dashboard
    else Password incorrect
        B-->>F: 401 Unauthorized
        F-->>U: Show error message
    end
```

### UML Sequence Diagram - Messaging Flow

```mermaid
sequenceDiagram
    participant S as Sender
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB
    participant R as Receiver

    S->>F: Type and send message
    F->>B: POST /api/messages (with JWT)
    B->>B: Verify JWT token
    B->>B: Create conversationId (sorted user IDs)
    B->>DB: Save message document
    DB-->>B: Message saved
    B-->>F: 201 Created + message data
    F-->>S: Show message in chat

    R->>F: Open conversation
    F->>B: GET /api/messages/:partnerId
    B->>B: Verify JWT
    B->>DB: Find messages by conversationId
    B->>DB: Mark messages as read
    DB-->>B: Messages array
    B-->>F: 200 OK + messages
    F-->>R: Display conversation
```

### System Architecture Diagram

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        Browser["Web Browser"]
        Mobile["Mobile Browser"]
    end

    subgraph Frontend["Frontend (Vercel)"]
        HTML["HTML Pages"]
        CSS["Tailwind CSS"]
        JS["JavaScript"]
        Components["Reusable Components"]
    end

    subgraph Backend["Backend (Render)"]
        Express["Express.js Server"]
        Routes["API Routes"]
        Controllers["Controllers"]
        Middleware["Auth Middleware"]
        Models["Mongoose Models"]
    end

    subgraph Database["Database Layer"]
        MongoDB["MongoDB Atlas"]
        Sponsors[(Sponsors)]
        Sponsees[(Sponsees)]
        Messages[(Messages)]
        Documents[(Documents)]
    end

    subgraph External["External Services"]
        Google["Google OAuth"]
        Facebook["Facebook OAuth"]
    end

    Browser --> HTML
    Mobile --> HTML
    HTML --> CSS
    HTML --> JS
    JS --> Components
    JS -->|REST API| Express
    Express --> Routes
    Routes --> Middleware
    Middleware --> Controllers
    Controllers --> Models
    Models --> MongoDB
    MongoDB --> Sponsors
    MongoDB --> Sponsees
    MongoDB --> Messages
    MongoDB --> Documents
    JS --> Google
    JS --> Facebook
    Google -->|Credential| Express
```

---

## 📁 Project Structure

```
sponzobd/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   └── authController.js    # Auth logic (register, login, social)
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   ├── models/
│   │   ├── Sponsor.js           # Sponsor schema
│   │   ├── Sponsee.js           # Sponsee schema
│   │   ├── Message.js           # Message schema
│   │   └── Document.js          # Document schema
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── messages.js          # Messaging routes
│   │   └── documents.js         # Document routes
│   ├── server.js                # Express app entry point
│   ├── seed.js                  # Database seeder
│   └── package.json
│
├── frontend/
│   ├── assets/
│   │   ├── styles.css
│   │   └── images/
│   ├── components/
│   │   ├── navbar.html
│   │   └── navbar.js
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── login.html
│   │   │   ├── signup-choice.html
│   │   │   ├── sponsor-signup.html
│   │   │   ├── sponsee-signup.html
│   │   │   └── forgot-password.html
│   │   ├── dashboards/
│   │   │   ├── sponsor-dashboard.html
│   │   │   └── sponsee-dashboard.html
│   │   ├── profiles/
│   │   │   ├── sponsor-profile.html
│   │   │   └── sponsee-profile.html
│   │   ├── events/
│   │   │   ├── sponsors.html
│   │   │   └── sponsee.html
│   │   ├── messages.html
│   │   └── documents.html
│   ├── index.html               # Landing page
│   └── about.html
│
├── render.yaml                  # Render deployment config
├── vercel.json                  # Vercel deployment config
└── README files
```

---

## 🔐 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint            | Description                   |
| ------ | ------------------- | ----------------------------- |
| POST   | `/sponsor/register` | Register new sponsor          |
| POST   | `/sponsor/login`    | Login as sponsor              |
| GET    | `/sponsor/me`       | Get current sponsor profile   |
| PUT    | `/sponsor/update`   | Update sponsor profile        |
| POST   | `/sponsee/register` | Register new sponsee          |
| POST   | `/sponsee/login`    | Login as sponsee              |
| GET    | `/sponsee/me`       | Get current sponsee profile   |
| PUT    | `/sponsee/update`   | Update sponsee profile        |
| POST   | `/google`           | Google OAuth authentication   |
| POST   | `/facebook`         | Facebook OAuth authentication |
| POST   | `/forgot-password`  | Request password reset        |
| POST   | `/reset-password`   | Reset password with code      |
| GET    | `/sponsors`         | List all sponsors (public)    |
| GET    | `/sponsees`         | List all sponsees (public)    |

### Messages (`/api/messages`)

| Method | Endpoint           | Description                     |
| ------ | ------------------ | ------------------------------- |
| GET    | `/`                | Get all conversations           |
| GET    | `/:partnerId`      | Get messages with specific user |
| POST   | `/`                | Send a new message              |
| PUT    | `/:messageId/read` | Mark message as read            |
| GET    | `/unread/count`    | Get unread message count        |

### Documents (`/api/documents`)

| Method | Endpoint        | Description              |
| ------ | --------------- | ------------------------ |
| GET    | `/`             | Get user's documents     |
| POST   | `/`             | Upload new document      |
| GET    | `/:id`          | Get specific document    |
| DELETE | `/:id`          | Delete document          |
| POST   | `/:id/share`    | Share document with user |
| GET    | `/:id/download` | Download document        |

---

## 🔒 Security Features

1. **Password Security**: bcrypt hashing with salt rounds
2. **JWT Authentication**: 7-day token expiry, secure payload
3. **Input Validation**: Server-side validation with Mongoose
4. **CORS**: Configured for allowed origins
5. **XSS Protection**: Input sanitization
6. **Rate Limiting**: (Recommended for production)

---

## 🚀 Deployment URLs

- **Frontend**: https://sponzobd.vercel.app
- **Backend API**: https://test-6aiv.onrender.com/api
- **Health Check**: https://test-6aiv.onrender.com/api/health

---

## 📈 Future Enhancements

1. **Real-time Messaging** - WebSocket integration
2. **Payment Integration** - bKash, Nagad, Card payments
3. **Analytics Dashboard** - ROI tracking, engagement metrics
4. **Mobile App** - React Native or Flutter
5. **AI Matching** - Smart sponsor-sponsee recommendations
6. **Contract Management** - E-signatures, templates
7. **Notification System** - Email, push notifications
8. **Admin Panel** - User management, content moderation

---

## 👥 User Roles

| Role        | Description                         | Capabilities                                                       |
| ----------- | ----------------------------------- | ------------------------------------------------------------------ |
| **Sponsor** | Companies/brands looking to sponsor | Browse sponsees, manage requests, send messages, upload documents  |
| **Sponsee** | Event organizers, micro-influencers | Browse sponsors, request sponsorship, communicate, share proposals |

---

## 📝 Environment Variables

```env
# Backend (.env)
MONGODB_URI=mongodb+srv://...
PORT=5000
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
NODE_ENV=production

# Frontend (configured in code)
API_URL=https://test-6aiv.onrender.com/api
GOOGLE_CLIENT_ID=859134383388-...apps.googleusercontent.com
```

---

_Document generated on December 26, 2025_
