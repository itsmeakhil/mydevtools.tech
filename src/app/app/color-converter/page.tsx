'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Palette, Check } from 'lucide-react';

export default function ColorConverterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Hero Section */}
        <Card className="border-2 shadow-lg bg-gradient-to-br from-primary/5 via-primary/5 to-muted/10">
          <div className="p-8 md:p-12 text-center space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Palette className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Color Converter
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Convert colors between HEX, RGB, HSL, and more formats with live preview.
            </p>
          </div>
        </Card>

        {/* Main Converter */}
        <ColorConverter />
      </div>
    </div>
  );
}

interface ColorFormats {
  hex: string;
  rgb: string;
  hsl: string;
  cmyk: string;
}

function ColorConverter() {
  const [hex, setHex] = useState('#3b82f6');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [formats, setFormats] = useState<ColorFormats>({
    hex: '#3b82f6',
    rgb: 'rgb(59, 130, 246)',
    hsl: 'hsl(217, 91%, 60%)',
    cmyk: 'cmyk(76, 47, 0, 4)',
  });

  useEffect(() => {
    convertColor(hex);
  }, [hex]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const rgbToCmyk = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const k = 1 - Math.max(r, g, b);
    const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - b - k) / (1 - k);

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100),
    };
  };

  const convertColor = (hexValue: string) => {
    setError(null);
    
    if (!/^#?[0-9A-Fa-f]{6}$/.test(hexValue)) {
      setError('Invalid hex color');
      return;
    }

    const hexColor = hexValue.startsWith('#') ? hexValue : `#${hexValue}`;
    const rgb = hexToRgb(hexColor);

    if (!rgb) {
      setError('Failed to convert color');
      return;
    }

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

    setFormats({
      hex: hexColor,
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      cmyk: `cmyk(${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k})`,
    });
  };

  const handleCopy = async (value: string, format: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(format);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      // Silent fail
    }
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Color Format Converter
          </CardTitle>
          <CardDescription className="mt-2">
            Enter a hex color to convert to other formats
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Preview */}
        <div className="relative w-full h-32 rounded-lg overflow-hidden border-4 border-border shadow-lg">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: formats.hex }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="animate-in fade-in-50">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Hex Input */}
        <div className="space-y-2">
          <Label htmlFor="hex">Hex Color</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="hex"
                type="text"
                placeholder="#3b82f6"
                value={hex}
                onChange={(e) => {
                  const value = e.target.value;
                  setHex(value);
                }}
                className="pl-10 font-mono"
              />
              <div
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded border border-border"
                style={{ backgroundColor: hex }}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => handleCopy(formats.hex, 'hex')}
            >
              {copied === 'hex' ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Converted Formats */}
        <div className="grid gap-4 md:grid-cols-3">
          <FormatItem
            label="RGB"
            value={formats.rgb}
            onCopy={() => handleCopy(formats.rgb, 'rgb')}
            copied={copied === 'rgb'}
          />
          <FormatItem
            label="HSL"
            value={formats.hsl}
            onCopy={() => handleCopy(formats.hsl, 'hsl')}
            copied={copied === 'hsl'}
          />
          <FormatItem
            label="CMYK"
            value={formats.cmyk}
            onCopy={() => handleCopy(formats.cmyk, 'cmyk')}
            copied={copied === 'cmyk'}
          />
        </div>

        {/* Quick Colors */}
        <div className="space-y-3">
          <Label>Quick Colors</Label>
          <div className="grid grid-cols-8 gap-2">
            {[
              '#3b82f6',
              '#10b981',
              '#f59e0b',
              '#ef4444',
              '#8b5cf6',
              '#ec4899',
              '#06b6d4',
              '#84cc16',
            ].map((color) => (
              <button
                key={color}
                onClick={() => setHex(color)}
                className="aspect-square rounded-lg border-2 border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <h3 className="text-sm font-semibold mb-2">About Color Formats</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>HEX</strong>: Web colors (e.g., #3b82f6)</li>
            <li>• <strong>RGB</strong>: Red, Green, Blue channels (0-255)</li>
            <li>• <strong>HSL</strong>: Hue, Saturation, Lightness percentages</li>
            <li>• <strong>CMYK</strong>: Used for print design</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function FormatItem({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-mono break-all">{value}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onCopy}>
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </>
        )}
      </Button>
    </div>
  );
}

