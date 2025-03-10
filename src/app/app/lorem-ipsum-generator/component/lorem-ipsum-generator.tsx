"use client"

import { useState, useEffect } from "react"
import { Heart } from 'lucide-react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

// Define interface for SliderWithTooltip props
interface SliderWithTooltipProps {
  id: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  activeValue?: number;
}

export default function LoremIpsumGenerator() {
  const { theme } = useTheme()
  const [isFavorite, setIsFavorite] = useState(false)
  const [paragraphs, setParagraphs] = useState(1)
  const [sentencesPerParagraph, setSentencesPerParagraph] = useState(3)
  const [wordsPerSentence, setWordsPerSentence] = useState(8)
  const [startWithLoremIpsum, setStartWithLoremIpsum] = useState(true)
  const [asHtml, setAsHtml] = useState(false)
  const [generatedText, setGeneratedText] = useState("")
  const [activeSlider, setActiveSlider] = useState<string | null>(null)
  const [sliderValues, setSliderValues] = useState({
    paragraphs: 1,
    sentences: 3,
    words: 8
  })

  // Words bank for generating random text
  const words = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
    "ligula", "hac", "facilisi", "massa", "fusce", "habitasse", "semper", "pellentesque",
    "congue", "feugiat", "tortor", "nulla", "purus", "pharetra", "non", "velit",
    "sed", "justo", "vel", "nec", "nam", "quisque", "tellus", "integer", "nisl",
    "vivamus", "faucibus", "tempus", "auctor", "magna", "orci", "vitae", "duis",
    "cras", "eu", "at", "est", "in", "et", "commodo", "arcu", "aenean", "vestibulum"
  ]

  // Function to capitalize first letter of a string
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  // Function to generate a random word from the words bank
  const getRandomWord = () => {
    return words[Math.floor(Math.random() * words.length)]
  }

  // Function to generate a random sentence
  const generateSentence = (isFirst: boolean) => {
    let sentence = ""
    const wordCount = Math.max(3, Math.floor(wordsPerSentence + (Math.random() * 3) - 1))
    
    // If it's the first sentence and startWithLoremIpsum is true
    if (isFirst && startWithLoremIpsum) {
      sentence = "Lorem ipsum dolor sit amet"
      if (wordCount > 5) {
        for (let i = 0; i < wordCount - 5; i++) {
          sentence += ` ${getRandomWord()}`
        }
      }
    } else {
      // Generate a random sentence
      for (let i = 0; i < wordCount; i++) {
        if (i === 0) {
          sentence += capitalize(getRandomWord())
        } else {
          sentence += ` ${getRandomWord()}`
        }
      }
    }
    
    return `${sentence}.`
  }

  // Function to generate a paragraph
  const generateParagraph = (isFirst: boolean) => {
    let paragraph = ""
    const sentenceCount = Math.max(1, Math.floor(sentencesPerParagraph + (Math.random() * 2) - 1))
    
    for (let i = 0; i < sentenceCount; i++) {
      paragraph += ` ${generateSentence(isFirst && i === 0)}`
    }
    
    return paragraph.trim()
  }

  // Function to generate the lorem ipsum text
  const generateLoremIpsum = () => {
    let text = ""
    
    for (let i = 0; i < paragraphs; i++) {
      const paragraph = generateParagraph(i === 0)
      
      if (asHtml) {
        text += `<p>${paragraph}</p>${i < paragraphs - 1 ? '\n' : ''}`
      } else {
        text += `${paragraph}${i < paragraphs - 1 ? '\n\n' : ''}`
      }
    }
    
    return text
  }

  // Generate text when parameters change
  useEffect(() => {
    setGeneratedText(generateLoremIpsum())
  }, [paragraphs, sentencesPerParagraph, wordsPerSentence, startWithLoremIpsum, asHtml])

  // Function to copy text to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText)
      .then(() => {
        console.log("Text copied to clipboard")
      })
      .catch(err => {
        console.error("Failed to copy text: ", err)
      })
  }

  // Function to refresh the generated text
  const refreshText = () => {
    setGeneratedText(generateLoremIpsum())
  }

  // Handler functions for slider changes
  const handleParagraphsChange = (value: number) => {
    setParagraphs(value);
    setSliderValues(prev => ({ ...prev, paragraphs: value }));
  }

  const handleSentencesChange = (value: number) => {
    setSentencesPerParagraph(value);
    setSliderValues(prev => ({ ...prev, sentences: value }));
  }

  const handleWordsChange = (value: number) => {
    setWordsPerSentence(value);
    setSliderValues(prev => ({ ...prev, words: value }));
  }

  // Slider tooltip component with continuous dragging
  const SliderWithTooltip = ({ id, min, max, step, value, onChange }: SliderWithTooltipProps) => {
    const isActive = activeSlider === id;
  
    return (
      <div className="relative w-full h-12">
        <Slider
          id={id}
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={(newValue) => {
            onChange(newValue[0]);
          }}
          onValueCommit={() => {
            // Optional: you can keep this if you want the tooltip to hide after dragging stops
            // setActiveSlider(null);
          }}
          onPointerDown={() => {
            setActiveSlider(id);
          }}
          className="w-full"
        />
        {isActive && (
          <div 
            className="absolute bg-primary text-primary-foreground rounded-md px-2 py-1 text-xs font-medium transform -translate-x-1/2 -translate-y-full pointer-events-none"
            style={{ 
              left: `${((value - min) / (max - min)) * 100}%`,
              bottom: '40px'
            }}
          >
            {value}
          </div>
        )}
      </div>
    );
  };
  

  return (
    <div className="flex justify-center items-center p-4 min-h-[600px]">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="relative pb-2">
          <div className="absolute right-6 top-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
              className="text-muted-foreground hover:text-primary"
            >
              <Heart className={cn("h-6 w-6", isFavorite ? "fill-primary text-primary" : "")} />
              <span className="sr-only">Toggle favorite</span>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-center">Lorem ipsum generator</h1>
          <p className="text-center text-muted-foreground mt-2">
            Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document
            or a typeface without relying on meaningful content
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="space-y-5 bg-muted/30 p-6 rounded-lg">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <Label htmlFor="paragraphs" className="w-48">Paragraphs</Label>
                <div className="w-full">
                  <SliderWithTooltip
                    id="paragraphs"
                    min={1}
                    max={10}
                    step={1}
                    value={sliderValues.paragraphs}
                    onChange={handleParagraphsChange}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <Label htmlFor="sentences" className="w-48">Sentences per paragraph</Label>
                <div className="w-full">
                  <SliderWithTooltip
                    id="sentences"
                    min={1}
                    max={10}
                    step={1}
                    value={sliderValues.sentences}
                    onChange={handleSentencesChange}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <Label htmlFor="words" className="w-48">Words per sentence</Label>
                <div className="w-full">
                  <SliderWithTooltip
                    id="words"
                    min={3}
                    max={15}
                    step={1}
                    value={sliderValues.words}
                    onChange={handleWordsChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <Label htmlFor="start-lorem" className="w-48">Start with lorem ipsum?</Label>
              <Switch
                id="start-lorem"
                checked={startWithLoremIpsum}
                onCheckedChange={setStartWithLoremIpsum}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <Label htmlFor="as-html" className="w-48">As html?</Label>
              <Switch
                id="as-html"
                checked={asHtml}
                onCheckedChange={setAsHtml}
              />
            </div>
            
            <Textarea
              value={generatedText}
              readOnly
              className="min-h-[150px] mt-4 font-mono text-sm"
            />
            
            <div className="flex justify-center gap-4 mt-4">
              <Button onClick={copyToClipboard}>
                Copy
              </Button>
              <Button variant="secondary" onClick={refreshText}>
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}