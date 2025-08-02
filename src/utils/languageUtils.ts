// Language detection and utility functions for MealBridge Sri Lanka

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: "ltr" | "rtl";
}

export const supportedLanguages: LanguageConfig[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    direction: "ltr",
  },
  {
    code: "si",
    name: "Sinhala",
    nativeName: "සිංහල",
    flag: "🇱🇰",
    direction: "ltr",
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    flag: "🇱🇰",
    direction: "ltr",
  },
];

/**
 * Detect user's preferred language based on browser settings
 */
export const detectUserLanguage = (): string => {
  // Check localStorage first
  const savedLanguage = localStorage.getItem("mealbridge-language");
  if (
    savedLanguage &&
    supportedLanguages.some((lang) => lang.code === savedLanguage)
  ) {
    return savedLanguage;
  }

  // Check browser language
  const browserLang = navigator.language || (navigator as any).userLanguage;
  const primaryLang = browserLang.split("-")[0];

  // Map browser language codes to our supported languages
  const languageMapping: { [key: string]: string } = {
    en: "en",
    si: "si",
    ta: "ta",
    sin: "si", // Alternative code for Sinhala
    tam: "ta", // Alternative code for Tamil
  };

  return languageMapping[primaryLang] || "en";
};

/**
 * Get language configuration by code
 */
export const getLanguageConfig = (code: string): LanguageConfig | undefined => {
  return supportedLanguages.find((lang) => lang.code === code);
};

/**
 * Format language display name
 */
export const formatLanguageName = (
  code: string,
  includeNative: boolean = true
): string => {
  const config = getLanguageConfig(code);
  if (!config) return code;

  if (includeNative && config.name !== config.nativeName) {
    return `${config.name} (${config.nativeName})`;
  }

  return config.name;
};

/**
 * Check if Google Translate is available
 */
export const isGoogleTranslateAvailable = (): boolean => {
  return (
    typeof (window as any).google !== "undefined" &&
    typeof (window as any).google.translate !== "undefined"
  );
};

/**
 * Create a language change event for analytics
 */
export const trackLanguageChange = (fromLang: string, toLang: string): void => {
  // This can be enhanced with analytics tracking
  console.log(`Language changed from ${fromLang} to ${toLang}`);

  // Optional: Send to analytics service
  // analytics.track('language_changed', { from: fromLang, to: toLang });
};

/**
 * Get RTL/LTR direction for a language
 */
export const getTextDirection = (code: string): "ltr" | "rtl" => {
  const config = getLanguageConfig(code);
  return config?.direction || "ltr";
};

/**
 * Apply language-specific document settings
 */
export const applyLanguageSettings = (code: string): void => {
  const config = getLanguageConfig(code);
  if (!config) return;

  // Set document direction
  document.documentElement.dir = config.direction;

  // Set language attribute
  document.documentElement.lang = code;

  // Add language-specific CSS class
  document.body.className =
    document.body.className
      .replace(/\blang-\w+\b/g, "") // Remove existing language classes
      .trim() + ` lang-${code}`;
};
