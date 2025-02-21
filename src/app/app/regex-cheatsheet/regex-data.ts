export type RegexEntry = {
    expression: string
    description: string
  }
  
  export type RegexSection = {
    name: string
    entries: RegexEntry[]
    notes?: string[]
    subsections?: {
      name: string
      entries: RegexEntry[]
      notes?: string[]
    }[]
  }
  
  export const regexData: RegexSection[] = [
    {
      name: "Normal Characters",
      entries: [
        { expression: ".", description: "Any character excluding a newline or carriage return" },
        { expression: "[A-Za-z]", description: "Alphabet (both uppercase and lowercase)" },
        { expression: "[a-z]", description: "Lowercase alphabet" },
        { expression: "[A-Z]", description: "Uppercase alphabet" },
        { expression: "\\d or [0-9]", description: "Digit" },
        { expression: "\\D or [^0-9]", description: "Non-digit" },
        { expression: "_", description: "Underscore" },
        { expression: "\\w or [A-Za-z0-9_]", description: "Alphabet, digit, or underscore" },
        { expression: "\\W or [^A-Za-z0-9_]", description: "Inverse of \\w (not alphabet, digit, or underscore)" },
        { expression: "\\s", description: "Space, tab, newline, or carriage return" },
        { expression: "\\S", description: "Inverse of \\s (not space, tab, newline, or carriage return)" },
      ],
    },
    {
      name: "Whitespace Characters",
      entries: [
        { expression: " ", description: "Space" },
        { expression: "\\t", description: "Tab" },
        { expression: "\\n", description: "Newline" },
        { expression: "\\r", description: "Carriage return" },
        { expression: "\\s", description: "Space, tab, newline, or carriage return" },
      ],
    },
    {
      name: "Boundaries",
      entries: [
        { expression: "^", description: "Start of string" },
        { expression: "$", description: "End of string" },
        { expression: "\\b", description: "Word boundary" },
      ],
      notes: [
        "How word boundary matching works:",
        "At the beginning of the string if the first character is \\w.",
        "Between two adjacent characters within the string, if the first character is \\w and the second character is \\W.",
        "At the end of the string if the last character is \\w.",
      ],
    },
    {
      name: "Matching",
      entries: [
        { expression: "foo|bar", description: "Match either foo or bar" },
        { expression: "foo(?=bar)", description: "Match foo if it's before bar" },
        { expression: "foo(?!bar)", description: "Match foo if it's not before bar" },
        { expression: "(?<=bar)foo", description: "Match foo if it's after bar" },
        { expression: "(?<!bar)foo", description: "Match foo if it's not after bar" },
      ],
    },
    {
      name: "Grouping and Capturing",
      entries: [
        { expression: "(foo)", description: "Capturing group; match and capture foo" },
        { expression: "(?:foo)", description: "Non-capturing group; match foo but without capturing foo" },
        { expression: "(foo)bar\\1", description: "\\1 is a backreference to the 1st capturing group; match foobarfoo" },
      ],
      notes: [
        "Capturing groups are only relevant in the following methods:",
        "string.match(regex)",
        "string.matchAll(regex)",
        "string.replace(regex, callback)",
        "\\n is a backreference to the nth capturing group. Capturing groups are numbered starting from 1.",
      ],
    },
    {
      name: "Character Set",
      entries: [
        { expression: "[xyz]", description: "Either x, y, or z" },
        { expression: "[^xyz]", description: "Neither x, y, nor z" },
        { expression: "[1-3]", description: "Either 1, 2, or 3" },
        { expression: "[^1-3]", description: "Neither 1, 2, nor 3" },
      ],
      notes: [
        "Think of a character set as an OR operation on the single characters that are enclosed between the square brackets [...].",
        "Use ^ after the opening [ to 'negate' the character set.",
        "Within a character set, . means a literal period.",
      ],
    },
    {
      name: "Quantifiers",
      entries: [
        { expression: "{2}", description: "Exactly 2" },
        { expression: "{2,}", description: "At least 2" },
        { expression: "{2,7}", description: "At least 2 but no more than 7" },
        { expression: "*", description: "0 or more" },
        { expression: "+", description: "1 or more" },
        { expression: "?", description: "Exactly 0 or 1" },
      ],
      notes: ["The quantifier goes after the expression to be quantified."],
    },
    {
      name: "Characters That Require Escaping",
      entries: [],
      subsections: [
        {
          name: "Outside a Character Set",
          entries: [
            { expression: "\\.", description: "Period" },
            { expression: "\\^", description: "Caret" },
            { expression: "\\$", description: "Dollar sign" },
            { expression: "\\|", description: "Pipe" },
            { expression: "\\\\", description: "Back slash" },
            { expression: "\\/", description: "Forward slash" },
            { expression: "\\(", description: "Opening bracket" },
            { expression: "\\)", description: "Closing bracket" },
            { expression: "\\[", description: "Opening square bracket" },
            { expression: "\\]", description: "Closing square bracket" },
            { expression: "\\{", description: "Opening curly bracket" },
            { expression: "\\}", description: "Closing curly bracket" },
          ],
        },
        {
          name: "Inside a Character Set",
          entries: [
            { expression: "\\\\", description: "Back slash" },
            { expression: "\\]", description: "Closing square bracket" },
          ],
          notes: [
            "^ must be escaped only if it occurs immediately after the opening [ of the character set.",
            "- must be escaped only if it occurs between two alphabets or two digits.",
          ],
        },
      ],
    },
  ]
  
  