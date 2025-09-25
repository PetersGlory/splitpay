import React from 'react';
import { Badge } from './ui/badge';
import { Alert } from './ui/alert';
import { AlertCircle } from 'lucide-react';

export function DemoModeIndicator() {
  return (
    <div className="fixed top-16 right-4 z-50 lg:top-4">
      <Alert className="bg-green-50 border-green-200 text-green-800 shadow-lg max-w-sm">
        <AlertCircle className="h-4 w-4" />
        <div className="space-y-1">
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Live Mode
          </Badge>
          <p className="text-xs">Connected to SpleetPay backend</p>
        </div>
      </Alert>
    </div>
  );
}