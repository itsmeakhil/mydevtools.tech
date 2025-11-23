'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { CopyIcon, SearchIcon, CheckIcon, Type } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Font options moved outside component to avoid recreation on each render
const FONT_OPTIONS: string[] = [
  '1Row', '3-D', '3D Diagonal', '3D-ASCII', '3x5', '4Max', '5 Line Oblique', 'AMC 3 Line',
  'ANSI Regular', 'ANSI Shadow', 'ASCII New Roman', 'Acrobatic', 'Alligator', 'Alligator2',
  'Alpha', 'Alphabet', 'Avatar', 'Banner', 'Banner3', 'Banner3-D', 'Banner4', 'Barbwire',
  'Basic', 'Bear', 'Bell', 'Benjamin', 'Big', 'Big Chief', 'Big Money-ne', 'Bigfig', 'Binary',
  'Block', 'Blocks', 'Bloody', 'Bolger', 'Braced', 'Bright', 'Broadway', 'Broadway KB', 'Bubble',
  'Bulbhead', 'Caligraphy', 'Calvin S', 'Cards', 'Catwalk', 'Chiseled', 'Chunky', 'Coinstak',
  'Cola', 'Colossal', 'Computer', 'Contessa', 'Contrast', 'Cosmike', 'Crawford', 'Cricket',
  'Cursive', 'Cyberlarge', 'Cybermedium', 'Cybersmall', 'Cygnet', 'DANC4', 'DOS Rebel',
  'Dancing Font', 'Doh', 'Doom', 'Dot Matrix', 'Double', 'Dr Pepper', 'Efti Chess', 'Efti Font',
  'Efti Italic', 'Efti Piti', 'Efti Robot', 'Efti Wall', 'Efti Water', 'Electronic', 'Elite',
  'Epic', 'Fire Font-k', 'Fire Font-s', 'Flipped', 'Flower Power', 'Four Tops', 'Fraktur',
  'Fun Face', 'Fun Faces', 'Fuzzy', 'Georgia11', 'Ghost', 'Ghoulish', 'Glenyn', 'Goofy',
  'Gothic', 'Graceful', 'Gradient', 'Graffiti', 'Greek', 'Heart Left', 'Heart Right', 'Henry 3D',
  'Hex', 'Hieroglyphs', 'Hollywood', 'Horizontal Left', 'Horizontal Right', 'ICL-1900',
  'Impossible', 'Invita', 'Isometric1', 'Isometric2', 'Isometric3', 'Isometric4', 'Italic',
  'Ivrit', 'JS Block Letters', 'JS Bracket Letters', 'JS Capital Curves', 'JS Cursive',
  'JS Stick Letters', 'Jacky', 'Jazmine', 'Katakana', 'Kban', 'Keyboard', 'Knob', 'Konto',
  'Larry 3D', 'LCD', 'Lean', 'Letters', 'Line Blocks', 'Linux', 'Lockergnome', 'Madrid',
  'Marquee', 'Maxfour', 'Merlin1', 'Merlin2', 'Mike', 'Mini', 'Mirror', 'Mnemonic', 'Modular',
  'Morse', 'Moscow', 'Mshebrew210', 'Muzzle', 'NScript', 'NT Greek', 'Nancyj', 'Nancyj-Fancy',
  'Nancyj-Underlined', 'Nipples', 'O8', 'OS2', 'Octal', 'Ogre', 'Old Banner', 'Pagga',
  'Patorjk-HeX', 'Pawp', 'Peaks', 'Pebbles', 'Pepper', 'Poison', 'Puffy', 'Puzzle', 'Pyramid',
  'Rammstein', 'Relief', 'Relief2', 'Reverse', 'Roman', 'Rot13', 'Rotated', 'Rounded',
  'Rowan Cap', 'Rozzo', 'Runic', 'Runyc', 'S Blood', 'SL Script', 'Santa Clara', 'Script',
  'Serifcap', 'Shadow', 'Shimrod', 'Short', 'Slant', 'Slide', 'Small', 'Small Caps',
  'Small Isometric1', 'Small Keyboard', 'Small Poison', 'Small Script', 'Small Shadow',
  'Small Slant', 'Small Tengwar', 'Speed', 'Spliff', 'Stampatello', 'Standard', 'Star Strips',
  'Star Wars', 'Stellar', 'Stforek', 'Stick Letters', 'Stop', 'Straight', 'Stronger Than All',
  'Sub-Zero', 'Swamp Land', 'Swan', 'Sweet', 'Tanja', 'Tengwar', 'Term', 'Test1', 'The Edge',
  'Thick', 'Thin', 'Thorned', 'Three Point', 'Ticks', 'Ticks Slant', 'Tiles', 'Tinker-Toy',
  'Tombstone', 'Train', 'Trek', 'Tsalagi', 'Tubular', 'Twisted', 'USA Flag', 'Univers',
  'Varsity', 'Wavy', 'Weird', 'Wet Letter', 'Whimsy', 'Wow',
];

const AsciiArtGenerator = () => {
  // State management
  const [inputText, setInputText] = useState('Ascii ART');
  const [fontStyle, setFontStyle] = useState<string>('Weird');
  const [width, setWidth] = useState(33);
  const [asciiOutput, setAsciiOutput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Filters font options based on search term
  const filteredFontOptions = searchTerm
    ? FONT_OPTIONS.filter(font => font.toLowerCase().includes(searchTerm.toLowerCase()))
    : FONT_OPTIONS;

  // Set up figlet configuration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate ASCII art when inputs change
  useEffect(() => {
    if (inputText) generateAscii();
  }, [inputText, fontStyle, width]);

  // Handle dropdown clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate ASCII art function
  const generateAscii = async () => {
    if (!inputText) {
      setAsciiOutput('');
      return;
    }

    setProcessing(true);
    setError(false);

    try {
      const response = await fetch('/api/ascii-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          font: fontStyle,
          width,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate ASCII art');
      }

      const data = await response.json();
      setAsciiOutput(data.art);
    } catch (error) {
      console.error('Error generating ASCII art:', error);
      setError(true);
      setAsciiOutput('Error generating ASCII art. Please try a different font or text.');
    } finally {
      setProcessing(false);
    }
  };

  // Utility functions
  const copyToClipboard = () => {
    navigator.clipboard.writeText(asciiOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFontSelect = (font: string) => {
    setFontStyle(font);
    setDropdownOpen(false);
    setSearchTerm('');
  };

  // Helper to generate theme-based classes
  const getThemeClasses = (darkClass: string, lightClass: string) =>
    theme === 'dark' ? darkClass : lightClass;

  // Loading state before hydration
  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto p-6 min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">ASCII Art Text Generator</h1>
          <div className="border-t w-1/3 mx-auto my-4"></div>
          <p>Create ASCII art text with many fonts and styles.</p>
        </div>
        <div className="rounded-lg p-6 shadow-lg">
          <div className="animate-pulse">
            <div className="mb-6 h-24 bg-gray-300 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="h-10 bg-gray-300 rounded"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
            </div>
            <div className="h-40 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                  <Type className="h-5 w-5 text-primary" />
                </div>
                ASCII Art Text Generator
              </CardTitle>
              <CardDescription className="mt-2">
                Create ASCII art text with many fonts and styles.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input Section */}
            <div className="mb-6">
              <label htmlFor="textInput" className="block mb-2">Your text:</label>
              <textarea
                id="textInput"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className={`w-full h-24 ${getThemeClasses('bg-gray-700 text-white border-gray-600', 'bg-gray-100 text-gray-900 border-gray-300')
                  } border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none`}
                placeholder="Enter your text here..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Font Selection */}
              <div className="relative" ref={dropdownRef}>
                <label htmlFor="fontSelect" className="block mb-2">Font:</label>
                <div className="relative">
                  <div
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`w-full ${getThemeClasses('bg-gray-700 text-white border-gray-600', 'bg-gray-100 text-gray-900 border-gray-300')
                      } border rounded-lg p-2 flex justify-between items-center cursor-pointer`}
                  >
                    <span>{fontStyle}</span>
                    <span className="text-xs">▼</span>
                  </div>

                  {dropdownOpen && (
                    <div className={`absolute z-10 mt-1 w-full ${getThemeClasses('bg-gray-700 border-gray-600', 'bg-white border-gray-300')
                      } border rounded-lg shadow-lg max-h-64 overflow-auto`}>
                      {/* Search box */}
                      <div className={`sticky top-0 z-20 p-2 ${getThemeClasses('bg-gray-700', 'bg-white')}`}>
                        <div className="relative">
                          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-8 pr-2 py-2 ${getThemeClasses('bg-gray-800 text-white border-gray-600', 'bg-gray-100 text-gray-900 border-gray-300')
                              } border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500`}
                          />
                        </div>
                      </div>

                      {/* Font options */}
                      <div className="p-1">
                        {filteredFontOptions.map((font) => (
                          <div
                            key={font}
                            onClick={() => handleFontSelect(font)}
                            className={`p-2 cursor-pointer ${fontStyle === font
                              ? getThemeClasses('bg-gray-600 text-white', 'bg-gray-200 text-gray-900')
                              : ''
                              } hover:${getThemeClasses('bg-gray-600', 'bg-gray-100')} rounded`}
                          >
                            {font}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Width Control */}
              <div>
                <label htmlFor="widthControl" className="block mb-2">Width:</label>
                <div className="flex items-center">
                  <input
                    id="widthControl"
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    min="20"
                    max="100"
                    className={`w-24 ${getThemeClasses('bg-gray-700 text-white border-gray-600', 'bg-gray-100 text-gray-900 border-gray-300')
                      } border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-500`}
                  />
                  <button
                    onClick={() => width > 20 && setWidth(width - 1)}
                    className={`ml-2 w-10 h-10 ${getThemeClasses('bg-gray-700 border-gray-600 text-white hover:bg-gray-600', 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200')
                      } border rounded-lg focus:outline-none`}
                  >
                    −
                  </button>
                  <button
                    onClick={() => width < 100 && setWidth(width + 1)}
                    className={`ml-2 w-10 h-10 ${getThemeClasses('bg-gray-700 border-gray-600 text-white hover:bg-gray-600', 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200')
                      } border rounded-lg focus:outline-none`}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Output Section */}
            <div className="mb-6 relative">
              <div className="flex justify-between items-center mb-2">
                <label>ASCII Art text:</label>
              </div>

              {/* Loading state */}
              {processing && (
                <div className={`flex items-center justify-center p-4 ${getThemeClasses('bg-gray-700', 'bg-gray-200')
                  } rounded-lg`}>
                  <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${getThemeClasses('border-white', 'border-gray-900')
                    }`}></div>
                  <span className="ml-2">Loading font...</span>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className={`${getThemeClasses('bg-red-900/30 text-white', 'bg-red-100 text-red-800')
                  } rounded-lg p-4 text-center`}>
                  Current settings resulted in error. Try a different font or text.
                </div>
              )}

              {/* Output display */}
              {!processing && !error && asciiOutput && (
                <div className={`${getThemeClasses('bg-black', 'bg-gray-100')} rounded-lg p-4 mt-2 relative`}>
                  <pre className={`font-mono whitespace-pre overflow-x-auto ${getThemeClasses('text-white', 'text-gray-900')
                    }`}>
                    {asciiOutput}
                  </pre>

                  <button
                    onClick={copyToClipboard}
                    className="absolute bottom-4 right-4 p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 focus:outline-none"
                    title="Copy to clipboard"
                  >
                    {copied ? <CheckIcon className="h-5 w-5" /> : <CopyIcon className="h-5 w-5" />}
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AsciiArtGenerator;