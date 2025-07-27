// components/providers/config-validator.tsx
"use client"

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { validateConfig } from '@/lib/config';

export function ConfigValidator({ children }: { children: React.ReactNode }) {
  const [configError, setConfigError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    try {
      validateConfig();
      setConfigError(null);
    } catch (error: any) {
      setConfigError(error.message);
    } finally {
      setIsValidating(false);
    }
  }, []);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Validating configuration...</p>
        </div>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              <strong>Configuration Error:</strong>
              <br />
              {configError}
              <br />
              <br />
              Please check your environment variables in <code>.env.local</code>
              <br />
              <br />
              Missing variables should be added to your <code>.env.local</code> file:
              <br />
              <code className="text-xs bg-gray-100 p-2 block mt-2 rounded">
                NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here<br />
                NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here<br />
                NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain_here<br />
                NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
              </code>
            </AlertDescription>
          </Alert>
          <Button 
            className="w-full mt-4" 
            onClick={() => window.location.reload()}
          >
            Retry After Configuration
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}