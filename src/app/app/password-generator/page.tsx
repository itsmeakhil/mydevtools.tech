'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Copy, RefreshCw, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function PasswordGeneratorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <PasswordGenerator />
      </div>
    </div>
  );
}

function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
  });

  const generatePassword = useCallback(() => {
    const chars = {
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
      similar: 'il1Lo0O',
      ambiguous: '{}[]()/\\\'"~,;.<>',
    };

    let availableChars = '';
    
    if (options.lowercase) availableChars += chars.lowercase;
    if (options.uppercase) availableChars += chars.uppercase;
    if (options.numbers) availableChars += chars.numbers;
    if (options.symbols) availableChars += chars.symbols;

    if (options.excludeSimilar) {
      availableChars = availableChars.split('').filter(c => !chars.similar.includes(c)).join('');
    }
    if (options.excludeAmbiguous) {
      availableChars = availableChars.split('').filter(c => !chars.ambiguous.includes(c)).join('');
    }

    if (!availableChars) {
      setPassword('');
      return;
    }

    let newPassword = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      newPassword += availableChars[array[i] % availableChars.length];
    }

    setPassword(newPassword);
  }, [length, options]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fail
    }
  };

  const calculateStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: 'Empty', color: 'bg-gray-500' };
    
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (pwd.length >= 16) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score < 3) return { strength: score, label: 'Weak', color: 'bg-red-500' };
    if (score < 5) return { strength: score, label: 'Medium', color: 'bg-yellow-500' };
    if (score < 6) return { strength: score, label: 'Strong', color: 'bg-blue-500' };
    return { strength: score, label: 'Very Strong', color: 'bg-green-500' };
  };

  const strength = calculateStrength(password);

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <div className="text-center">
          <CardTitle className="text-3xl md:text-4xl mb-2">
            Password Generator
          </CardTitle>
          <CardDescription>
            Customize your password requirements and generate a secure password
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generated Password */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={password}
              readOnly
              className="text-center text-lg font-mono font-semibold"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button size="icon" onClick={handleCopy} variant="outline">
              {copied ? (
                <Check className="h-5 w-5" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
            <Button size="icon" onClick={generatePassword} variant="outline">
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Strength Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Password Strength</span>
              <Badge variant={strength.strength < 3 ? 'destructive' : strength.strength < 5 ? 'secondary' : 'default'}>
                {strength.label}
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
                style={{ width: `${(strength.strength / 7) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Length Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="length">Length: {length} characters</Label>
            <Badge variant="secondary">{length} chars</Badge>
          </div>
          <Slider
            id="length"
            min={4}
            max={64}
            step={1}
            value={[length]}
            onValueChange={(value) => setLength(value[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>4</span>
            <span>64</span>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Character Sets</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="text-lg font-bold">ABC</span>
                </div>
                <Label htmlFor="uppercase" className="cursor-pointer">
                  Uppercase Letters
                </Label>
              </div>
              <Switch
                id="uppercase"
                checked={options.uppercase}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, uppercase: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="text-lg font-bold">abc</span>
                </div>
                <Label htmlFor="lowercase" className="cursor-pointer">
                  Lowercase Letters
                </Label>
              </div>
              <Switch
                id="lowercase"
                checked={options.lowercase}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, lowercase: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="text-lg font-bold">123</span>
                </div>
                <Label htmlFor="numbers" className="cursor-pointer">
                  Numbers
                </Label>
              </div>
              <Switch
                id="numbers"
                checked={options.numbers}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, numbers: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="text-lg font-bold">!@#</span>
                </div>
                <Label htmlFor="symbols" className="cursor-pointer">
                  Symbols
                </Label>
              </div>
              <Switch
                id="symbols"
                checked={options.symbols}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, symbols: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Advanced Options</Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
              <Label htmlFor="exclude-similar" className="cursor-pointer">
                Exclude Similar Characters (i, l, 1, L, o, 0, O)
              </Label>
              <Switch
                id="exclude-similar"
                checked={options.excludeSimilar}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, excludeSimilar: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
              <Label htmlFor="exclude-ambiguous" className="cursor-pointer">
                Exclude Ambiguous Characters
              </Label>
              <Switch
                id="exclude-ambiguous"
                checked={options.excludeAmbiguous}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, excludeAmbiguous: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <h3 className="text-sm font-semibold mb-2">Password Security Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
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

