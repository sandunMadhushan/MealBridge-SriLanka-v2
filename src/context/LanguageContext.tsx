import React, { createContext, useContext, useState, useEffect } from "react";

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  isTranslating: boolean;
  isGoogleTranslateLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

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

// Global flag to prevent multiple initializations
let isGoogleTranslateInitializing = false;
let isGoogleTranslateReady = false;

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem("mealbridge-language") || "en";
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGoogleTranslateLoaded, setIsGoogleTranslateLoaded] = useState(false);

  // Initialize Google Translate once
  useEffect(() => {
    if (isGoogleTranslateInitializing || isGoogleTranslateReady) {
      return;
    }

    isGoogleTranslateInitializing = true;

    // Prevent conflicts with existing global function
    if (!(window as any).googleTranslateElementInit) {
      (window as any).googleTranslateElementInit = () => {
        try {
          if (!(window as any).google?.translate?.TranslateElement) {
            console.error("Google Translate API not available");
            return;
          }

          new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,si,ta",
              layout: (window as any).google.translate.TranslateElement
                .InlineLayout.VERTICAL,
              autoDisplay: false,
            },
            "google_translate_element"
          );

          isGoogleTranslateReady = true;
          setIsGoogleTranslateLoaded(true);
        } catch (error) {
          console.error("❌ Error initializing Google Translate:", error);
          isGoogleTranslateInitializing = false;
        }
      };
    }

    // Load script only if not already loaded
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.onerror = () => {
        console.error("❌ Failed to load Google Translate script");
        isGoogleTranslateInitializing = false;
      };
      document.head.appendChild(script);
    }
  }, []);

  const triggerTranslation = (languageCode: string) => {
    if (!isGoogleTranslateReady) {
      return;
    }

    // Wait for combo to appear with retries
    let attempts = 0;
    const maxAttempts = 10;

    const findCombo = () => {
      const combo = document.querySelector(
        ".goog-te-combo"
      ) as HTMLSelectElement;
      attempts++;

      if (combo) {
        combo.value = languageCode;
        combo.dispatchEvent(new Event("change", { bubbles: true }));
      } else if (attempts < maxAttempts) {
        setTimeout(findCombo, 300);
      } else {
        // Try alternative methods if combo not found
        const langLink = document.querySelector(
          `a[onclick*="${languageCode}"]`
        );
        if (langLink) {
          (langLink as HTMLElement).click();
        }
      }
    };

    findCombo();
  };

  const setLanguage = (language: string) => {
    setIsTranslating(true);
    setCurrentLanguage(language);

    // Save language preference
    localStorage.setItem("mealbridge-language", language);

    // Trigger translation if Google Translate is ready
    if (isGoogleTranslateReady && language !== "en") {
      setTimeout(() => triggerTranslation(language), 500);
    }

    // Reset translating state
    setTimeout(() => {
      setIsTranslating(false);
    }, 1500);
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
      {/* Google Translate Element - Hidden but accessible */}
      <div
        id="google_translate_element"
        className="google-translate-hidden"
      ></div>
      {children}
    </LanguageContext.Provider>
  );
};
