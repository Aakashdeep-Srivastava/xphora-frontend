# XphoraPulse API Integration Guide

## Quick Start

```typescript
import { api } from '@/lib/api';

// Login
const response = await api.auth.login({ email, password });

// Create incident
const incident = await api.incidents.create(incidentData);

// Get nearby incidents
const nearby = await api.incidents.getNearby({ latitude, longitude, radius: 5000 });
```

## Available APIs

- **Authentication**: Login, register, profile management
- **Incidents**: Create, read, update, delete incidents
- **Alerts**: City-wide alert system
- **Maps**: Geocoding, places, directions
- **Weather**: Current weather, forecasts, air quality
- **AI**: Image analysis, content verification
- **Emergency**: Emergency alert system
- **Notifications**: Push notifications
- **Reports**: Analytics and reporting
- **Media**: File upload and processing

See the generated files for detailed usage examples.
