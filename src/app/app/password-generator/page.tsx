'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { AdvancedGenerator } from '@/components/password-manager/advanced-generator';

export default function PasswordGeneratorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-3 md:p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        <PasswordGenerator />
      </div>
    </div>
  );
}

function PasswordGenerator() {
  return (
    <Card className="border shadow-lg">
      <CardHeader className="pb-3">
        <div className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-lg font-bold text-primary">
            <div className="p-1.5 bg-primary/10 rounded-lg shadow-sm">
              <Lock className="h-4 w-4 text-primary" />
            </div>
            Token / Password Generator
          </CardTitle>
          <CardDescription className="text-sm mt-1">
            Customize your requirements and generate secure tokens or passwords
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AdvancedGenerator initialLength={16} />

        {/* Info Section */}
        <div className="bg-muted/50 rounded-lg p-3 border border-border mt-4">
          <h3 className="text-xs font-semibold mb-1.5">Security Tips</h3>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            <li>• Use at least 12-16 characters for better security</li>
            <li>• Include uppercase, lowercase, numbers, and symbols</li>
            <li>• Avoid using personal information or dictionary words</li>
            <li>• Use a unique password for each account</li>
            <li>• Consider using a password manager</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
