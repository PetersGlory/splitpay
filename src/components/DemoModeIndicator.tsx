import React from 'react';
import { Badge } from './ui/badge';
import { Alert } from './ui/alert';
import { AlertCircle } from 'lucide-react';

export function DemoModeIndicator() {
  return (
    <div className="fixed top-16 right-4 z-50 lg:top-4">
      <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800 shadow-lg max-w-sm">
        <AlertCircle className="h-4 w-4" />
        <div className="space-y-1">
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Demo Mode
          </Badge>
          <p className="text-xs">Using mock data for demonstration</p>
        </div>
      </Alert>
    </div>
  );
}