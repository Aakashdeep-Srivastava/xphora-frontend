# XphoraPulse Frontend

Real-time city intelligence for Bengaluru citizens. A Progressive Web App (PWA) built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Real-time Data**: Live weather, air quality, traffic, and city mood data powered by Google APIs
- **Interactive Maps**: Google Maps integration with incident markers
- **Location-aware**: Automatic location detection with manual override using Google Geocoding
- **Incident Reporting**: AI-powered incident analysis and reporting with Gemini
- **Authentication**: Firebase Google Auth integration
- **PWA Support**: Installable app with offline capabilities
- **Responsive Design**: Mobile-first design with desktop support

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: Firebase Auth
- **Maps & Location**: Google Maps API, Geocoding API, Places API, Directions API
- **AI**: Google Gemini API
- **Animations**: Framer Motion + Lottie
- **State Management**: React Context + Hooks

## 📋 Prerequisites

- Node.js 18+ and npm 8+
- Google Cloud Platform account with billing enabled
- Firebase project (for authentication)
- Google Maps API key with required APIs enabled

## 🔧 Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd xphorapulse-frontend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up Google Cloud APIs**
   
   Enable these APIs in Google Cloud Console:
   - Maps JavaScript API
   - Geocoding API
   - Places API
   - Directions API
   - (Optional) Gemini API

4. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your API keys in `.env.local`:
   \`\`\`env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   \`\`\`

5. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗺️ Google APIs Integration

### Maps JavaScript API
- Interactive city maps
- Real-time incident markers
- Location visualization

### Geocoding API
- Convert coordinates to addresses
- Location name resolution
- Reverse geocoding for user location

### Places API
- Nearby business information
- City mood analysis based on ratings
- Local establishment data

### Directions API
- Real-time traffic data
- Route optimization
- Travel time estimation

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Other Platforms

1. **Build the application**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Start the production server**
   \`\`\`bash
   npm start
   \`\`\`

## 🔑 API Keys Setup

### Google Cloud Platform
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable required APIs (Maps, Geocoding, Places, Directions)
4. Create credentials (API Key)
5. Restrict the key to your domain and required APIs

### Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication with Google provider
4. Get your config from Project Settings

### Gemini AI (Optional)
1. Access Google AI Studio
2. Get your Gemini API key
3. Enable for multimodal analysis

## 📱 PWA Features

- **Installable**: Can be installed on mobile devices
- **Offline Support**: Basic functionality works offline
- **Push Notifications**: (Future feature)
- **Background Sync**: (Future feature)

## 🧪 Testing

\`\`\`bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check

# Run tests (when implemented)
npm test
\`\`\`

## 📊 Performance

- **Lighthouse Score**: 90+ on all metrics
- **Core Web Vitals**: Optimized for LCP, FID, CLS
- **Bundle Size**: Optimized with code splitting
- **Caching**: Aggressive caching for static assets
- **Google APIs**: Efficient API usage with caching

## 🔒 Security

- **CSP Headers**: Content Security Policy implemented
- **HTTPS Only**: Secure connections enforced
- **API Key Protection**: Client-side keys properly scoped
- **Input Validation**: All user inputs validated

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the repository or contact the development team.
