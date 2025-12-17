# Admin Panel

Next.js admin panel for managing the marketing website.

## Features

- **JWT Authentication**: Secure login system
- **Gallery Management**: Add, edit, delete, and reorder gallery items
- **Image Upload**: Upload images directly to the backend
- **About Us Management**: Edit company and team information
- **Contact Management**: Update contact details and social media links
- **Drag & Drop Reordering**: Easily reorder gallery items

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend API running on port 8080

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create or edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Run Development Server

```bash
npm run dev
```

The admin panel will be available at `http://localhost:3001`

### 4. Build for Production

```bash
npm run build
npm start
```

## Default Login Credentials

- **Username:** admin
- **Email:** admin@example.com
- **Password:** admin123

## Pages

- `/login` - Login page
- `/dashboard` - Dashboard home
- `/dashboard/gallery` - Gallery management
- `/dashboard/about` - About Us management
- `/dashboard/contact` - Contact management

## Features Details

### Gallery Management
- Add new gallery items with title, description, category, and image
- Upload images (max 10MB)
- Edit existing items
- Delete items
- Reorder items using up/down buttons
- Changes reflect immediately on customer website (via ISR)

### About Us Management
- Edit company name and description
- Edit owner/team member information
- Upload owner profile image
- All changes saved with one button

### Contact Management
- Update email, phone, and address
- Edit social media URLs (Facebook, Twitter, Instagram, LinkedIn)
- All changes saved together

## Authentication

The admin panel uses JWT tokens stored in localStorage.
- Login tokens are valid for 24 hours
- Tokens are automatically sent with all API requests
- Protected routes redirect to login if not authenticated

## Project Structure

```
app/
├── context/
│   └── AuthContext.tsx      # Authentication context
├── dashboard/
│   ├── layout.tsx            # Dashboard layout with sidebar
│   ├── page.tsx              # Dashboard home
│   ├── gallery/
│   │   └── page.tsx          # Gallery management
│   ├── about/
│   │   └── page.tsx          # About management
│   └── contact/
│       └── page.tsx          # Contact management
├── login/
│   └── page.tsx              # Login page
├── layout.tsx                # Root layout
└── page.tsx                  # Root redirect

lib/
└── apiClient.ts              # Axios client with JWT interceptor
```

## Technologies

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios
- JWT Authentication
