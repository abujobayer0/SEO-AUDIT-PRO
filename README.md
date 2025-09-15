# White Label SEO Audit Tool

A comprehensive SEO audit tool designed specifically for agencies who need to deliver professional, client-ready reports with white-label branding.

## 🚀 Features

### Core Functionality

- **Instant SEO Audits**: Get comprehensive website analysis in seconds
- **Professional Scoring**: 0-100 scoring system across multiple categories
- **White-Label Reports**: Branded PDF reports ready for client delivery
- **Progress Tracking**: Monitor improvements over time
- **Multi-Website Management**: Track multiple client websites

### Audit Categories

- **Performance**: Page speed, loading times, Core Web Vitals
- **SEO**: Meta tags, headings, content optimization
- **Mobile Friendliness**: Responsive design, mobile optimization
- **Accessibility**: Alt tags, form labels, color contrast
- **Technical**: HTTPS, canonical URLs, structured data
- **Content**: Word count, keyword usage, content quality

### Agency Features

- **Subscription Tiers**: Free, Basic ($19/month), Pro ($49/month)
- **Usage Tracking**: Monitor monthly scan limits
- **Custom Branding**: Upload logos, set brand colors
- **Client Management**: Organize audits by client
- **Professional Reports**: Non-technical language for clients

## 🛠️ Tech Stack

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Puppeteer** for web scraping and performance testing
- **Cheerio** for HTML parsing
- **PDFKit** for report generation
- **JWT** for authentication
- **Multer** for file uploads

### Frontend

- **Next.js 14** with App Router
- **React 18** with hooks
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hook Form** for form handling
- **Axios** for API calls

## 📦 Installation

### Prerequisites

- Node.js 18+
- MongoDB 6+
- npm or yarn

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd white-label-seo-audit-tool
   ```

2. **Install dependencies**

   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**

   ```bash
   # Copy environment file
   cd server
   cp env.example .env

   # Edit .env with your settings
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/seo-audit-tool
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=development
   ```

4. **Start MongoDB**

   ```bash
   # Make sure MongoDB is running
   mongod
   ```

5. **Run the application**

   ```bash
   # From root directory
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend client (port 3000).

## 🚀 Usage

### Getting Started

1. **Register an Account**

   - Visit `http://localhost:3000/register`
   - Enter your company name, email, and password
   - Start with the free tier (5 scans/month)

2. **Run Your First Audit**

   - Go to the dashboard
   - Enter a website URL
   - Click "Audit Now"
   - View the comprehensive report

3. **Generate Reports**
   - Click "Download PDF Report" on any audit
   - Reports are automatically branded with your company info
   - Share with clients immediately

### API Endpoints

#### Authentication

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user

#### Audits

- `POST /api/audit` - Perform new audit
- `GET /api/audit/history` - Get audit history
- `GET /api/audit/:id` - Get specific audit
- `GET /api/audit/stats/overview` - Get audit statistics

#### Reports

- `GET /api/reports/pdf/:auditId` - Download PDF report
- `GET /api/reports/summary/:auditId` - Get report summary

#### User Management

- `PUT /api/users/profile` - Update profile
- `POST /api/users/logo` - Upload logo
- `GET /api/users/subscription/plans` - Get subscription plans
- `POST /api/users/subscription/update` - Update subscription

## 📊 Subscription Plans

### Free Tier

- 5 monthly scans
- Basic SEO audit
- PDF reports
- Email support

### Basic ($19/month)

- 50 monthly scans
- Advanced SEO audit
- White-label PDF reports
- Custom branding
- Priority support
- Audit history tracking

### Pro ($49/month)

- 500 monthly scans
- Complete SEO audit suite
- Full white-label branding
- Custom report templates
- API access
- Priority support
- Advanced analytics
- Team collaboration

## 🔧 Configuration

### Custom Branding

1. Go to Settings in the dashboard
2. Upload your company logo
3. Set your brand color
4. All reports will use your branding

### Subscription Management

- Update subscription plans in `/server/routes/users.js`
- Modify scan limits in `/server/models/User.js`
- Add payment integration (Stripe recommended)

## 📁 Project Structure

```
white-label-seo-audit-tool/
├── server/                 # Backend API
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── middleware/        # Auth & validation
│   └── uploads/           # File uploads
├── client/                # Frontend app
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   └── styles/           # CSS files
└── package.json          # Root package.json
```

## 🚀 Deployment

### Backend Deployment

1. Set up MongoDB Atlas or self-hosted MongoDB
2. Deploy to Heroku, Railway, or DigitalOcean
3. Set environment variables
4. Configure CORS for your domain

### Frontend Deployment

1. Build the Next.js app: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Update API endpoints in production

### Environment Variables (Production)

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-production-secret
PORT=5000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@seoauditpro.com or create an issue in the repository.

## 🔮 Roadmap

- [ ] Payment integration (Stripe)
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] API rate limiting
- [ ] Automated recurring audits
- [ ] Integration with popular CMS platforms
- [ ] Mobile app
- [ ] Advanced reporting templates

---

**Built with ❤️ for agencies who want to deliver exceptional value to their clients.**
# SEO-AUDIT-PRO
