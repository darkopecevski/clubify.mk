# Clubify.mk

A comprehensive management system for youth football clubs in Macedonia.

## 📋 Project Overview

Clubify.mk is a modern web application designed to help Macedonian youth football clubs manage their operations, including:

- **Team Management** - Organize teams by age groups
- **Player Management** - Comprehensive player profiles with medical info, stats, and more
- **Training Sessions** - Schedule recurring training, track attendance
- **Match Management** - Schedule matches, record results, track player statistics
- **Payment Tracking** - Monitor monthly subscriptions and payments
- **Public Pages** - Each club gets their own public homepage
- **Multi-role Access** - Super admin, club admin, coach, parent, and player roles

## 🎯 Key Features

✅ Multi-tenant architecture (isolated club data)
✅ Role-based access control with database-level security
✅ Real-time notifications
✅ Multi-language support (English, Macedonian, Albanian)
✅ Responsive design for mobile and desktop
✅ Photo galleries and announcements
✅ CSV import for bulk player creation
✅ Comprehensive attendance tracking
✅ Match statistics and player performance tracking

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** TanStack Query + Zustand
- **Forms:** React Hook Form + Zod

### Backend
- **Platform:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Database:** PostgreSQL 15+
- **Authentication:** Supabase Auth (JWT + Row Level Security)
- **API:** Auto-generated REST API (PostgREST) + Next.js API routes

### Deployment
- **Frontend:** Netlify
- **Backend/Database:** Supabase Cloud
- **Email:** Resend
- **Version Control:** GitHub

## 📚 Documentation

Comprehensive documentation is available in the `/docs` folder:

### Business Requirements
- **[Product Requirements](docs/product-requirements.md)** - Complete PRD with features, objectives, and success metrics
- **[User Roles & Permissions](docs/user-roles-permissions.md)** - Detailed role definitions and permission matrix
- **[Feature Specifications](docs/feature-specifications.md)** - User stories and acceptance criteria for all features
- **[Data Model Overview](docs/data-model-overview.md)** - Business-level data entities and relationships

### Technical Documentation
- **[Technical Architecture](docs/technical-architecture.md)** - System architecture, data flow, security layers
- **[Technology Stack](docs/technology-stack.md)** - Complete tech stack with versions and rationale
- **[Database Schema](docs/database-schema.md)** - PostgreSQL schema, tables, indexes, and RLS policies
- **[Project Setup Guide](docs/project-setup-guide.md)** - Step-by-step setup instructions

### Q&A Sessions
- **[Business Requirements Q&A](docs/requirements-qa.md)** - Business decisions and clarifications
- **[Technical Requirements Q&A](docs/technical-requirements-qa.md)** - Technical stack decisions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ LTS
- pnpm 8+
- Git
- Supabase account (free)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/clubify.mk.git
cd clubify.mk

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Fill in your environment variables in .env.local
# - Supabase URL and keys
# - Resend API key
# - etc.

# Run database migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --linked > types/database.types.ts

# Start development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

For detailed setup instructions, see **[Project Setup Guide](docs/project-setup-guide.md)**

## 📖 Development

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix linting issues
pnpm format       # Format code with Prettier
pnpm type-check   # TypeScript type checking
pnpm test         # Run unit tests
pnpm test:e2e     # Run E2E tests
```

### Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: add feature"`
3. Push and create PR: `git push origin feature/your-feature`
4. After review, merge to main

## 🗂️ Project Structure

```
clubify.mk/
├── app/                    # Next.js App Router
│   ├── [locale]/          # i18n routing
│   │   ├── (auth)/        # Protected routes
│   │   └── (public)/      # Public routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── shared/           # Shared components
├── lib/                  # Utilities and helpers
├── types/                # TypeScript types
├── messages/             # i18n translations
├── supabase/             # Supabase config & migrations
├── docs/                 # Documentation
└── tests/                # Test files
```

## 🌐 Multi-Language Support

Clubify.mk supports three languages:
- 🇬🇧 English (en)
- 🇲🇰 Macedonian (mk)
- 🇦🇱 Albanian (sq)

Translations are managed in the `/messages` folder.

## 🔐 Security

- **Row Level Security (RLS)** - Database-level access control
- **Multi-tenant isolation** - Complete data separation between clubs
- **JWT Authentication** - Secure token-based auth
- **Encrypted sensitive data** - Medical information encrypted at rest
- **HTTPS only** - All traffic encrypted in transit

## 📦 Deployment

### Netlify (Frontend)
- Automatic deployments from `main` branch
- Deploy previews for pull requests
- Environment variables configured in Netlify dashboard

### Supabase (Backend)
- Database migrations via Supabase CLI
- Edge functions deployed via Supabase CLI
- Automatic backups and connection pooling

See **[Project Setup Guide - Deployment](docs/project-setup-guide.md#9-deployment)** for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

Please ensure:
- Code passes linting (`pnpm lint`)
- TypeScript compiles (`pnpm type-check`)
- Tests pass (`pnpm test`)
- Code is formatted (`pnpm format`)

## 📄 License

[MIT License](LICENSE) - feel free to use this project for your club!

## 👥 Team

- **Project Lead:** [Your Name]
- **Documentation:** AI-Assisted Planning

## 📞 Support

- **Documentation:** See `/docs` folder
- **Issues:** [GitHub Issues](https://github.com/your-username/clubify.mk/issues)
- **Email:** support@clubify.mk

## 🗺️ Roadmap

### Phase 1 (MVP) - Current
- [x] Requirements gathering
- [x] Technical architecture
- [x] Database schema design
- [ ] Authentication implementation
- [ ] Club management
- [ ] Player management
- [ ] Team management
- [ ] Basic payment tracking

### Phase 2
- [ ] Training session management
- [ ] Match management
- [ ] Attendance tracking
- [ ] Email notifications
- [ ] Public club pages
- [ ] Media gallery

### Phase 3 (Future)
- [ ] Online payment processing (Casys integration)
- [ ] Mobile native apps (React Native)
- [ ] Advanced analytics
- [ ] In-app messaging
- [ ] League management (cross-club)

## 🎉 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TanStack Query](https://tanstack.com/query) - Data fetching

---

**Built with ❤️ for Macedonian youth football clubs**

🚀 **Ready to transform how your club operates? Let's get started!**

For detailed setup instructions, see **[Project Setup Guide](docs/project-setup-guide.md)**

---
