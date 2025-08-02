import React, { createContext, useContext, useState, useEffect } from "react";
import {
  detectUserLanguage,
  applyLanguageSettings,
  isGoogleTranslateAvailable,
} from "../utils/languageUtils";

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  isTranslating: boolean;
  isGoogleTranslateLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const GOOGLE_TRANSLATE_ELEMENT_ID = "google-translate-element";

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return detectUserLanguage();
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGoogleTranslateLoaded, setIsGoogleTranslateLoaded] = useState(false);

  // Apply initial language settings
  useEffect(() => {
    applyLanguageSettings(currentLanguage);
  }, []);

  // Load Google Translate script
  useEffect(() => {
    const addGoogleTranslateScript = () => {
      if (document.getElementById("google-translate-script")) {
        // Check if already loaded
        if (isGoogleTranslateAvailable()) {
          setIsGoogleTranslateLoaded(true);
        }
        return;
      }

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.type = "text/javascript";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.onerror = () => {
        console.error("Failed to load Google Translate script");
        setIsGoogleTranslateLoaded(false);
      };
      document.head.appendChild(script);

      // Initialize Google Translate
      (window as any).googleTranslateElementInit = () => {
        try {
          new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,si,ta",
              layout: (window as any).google.translate.TranslateElement
                .InlineLayout.SIMPLE,
              autoDisplay: false,
              multilanguagePage: true,
            },
            GOOGLE_TRANSLATE_ELEMENT_ID
          );
          setIsGoogleTranslateLoaded(true);

          // If there's a saved language preference that's not English, apply it
          if (currentLanguage !== "en") {
            setTimeout(() => {
              triggerTranslation(currentLanguage);
            }, 1000);
          }
        } catch (error) {
          console.error("Error initializing Google Translate:", error);
          setIsGoogleTranslateLoaded(false);
        }
      };
    };

    addGoogleTranslateScript();
  }, [currentLanguage]);

  const triggerTranslation = (language: string) => {
    const translateElement = document.querySelector(
      ".goog-te-combo"
    ) as HTMLSelectElement;
    if (translateElement) {
      translateElement.value = language;
      translateElement.dispatchEvent(new Event("change"));
    }
  };

  const setLanguage = (language: string) => {
    if (!isGoogleTranslateLoaded) {
      console.warn("Google Translate is not loaded yet");
      return;
    }

    const previousLanguage = currentLanguage;
    setIsTranslating(true);
    setCurrentLanguage(language);

    // Save language preference
    localStorage.setItem("mealbridge-language", language);

    // Apply language settings
    applyLanguageSettings(language);

    // Use Google Translate to translate the page
    setTimeout(() => {
      triggerTranslation(language);

      // Track language change for analytics
      console.log(`Language changed from ${previousLanguage} to ${language}`);

      // Reset translating state after a delay
      setTimeout(() => {
        setIsTranslating(false);
      }, 2000);
    }, 100);
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        isTranslating,
        isGoogleTranslateLoaded,
      }}
    >
      {/* Hidden Google Translate Element */}
      <div id={GOOGLE_TRANSLATE_ELEMENT_ID} className="hidden"></div>
      {children}
    </LanguageContext.Provider>
  );
};
