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
  const [hasInitialTranslation, setHasInitialTranslation] = useState(false);
  const [isSwitchingLanguage, setIsSwitchingLanguage] = useState(false);

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
              multilanguagePage: true, // Enable better language switching
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

  // Handle initial language setup after Google Translate loads
  useEffect(() => {
    if (!isGoogleTranslateLoaded || hasInitialTranslation) {
      return;
    }

    // This effect should only run once on initial load.
    setHasInitialTranslation(true);

    // Check if we just reloaded after switching to English
    const justSwitchedToEnglish = sessionStorage.getItem(
      "mealbridge-switching-to-english"
    );

    if (justSwitchedToEnglish) {
      console.log(
        "🇬🇧 Page reloaded after switching to English. State is clean."
      );
      sessionStorage.removeItem("mealbridge-switching-to-english");
      // Ensure language state is 'en' and do not proceed to auto-translate
      if (currentLanguage !== "en") {
        setCurrentLanguage("en");
      }
      return;
    }

    // Proceed with auto-translation for non-English languages
    const savedLanguage = localStorage.getItem("mealbridge-language");
    if (savedLanguage && savedLanguage !== "en") {
      console.log(`🔄 Auto-translating to saved language: ${savedLanguage}`);
      // Align state and trigger translation
      setCurrentLanguage(savedLanguage);
      triggerTranslation(savedLanguage);
    }
  }, [isGoogleTranslateLoaded, hasInitialTranslation]);

  const triggerTranslation = (languageCode: string) => {
    if (!isGoogleTranslateReady) {
      return;
    }

    console.log(`🔄 Triggering translation to: ${languageCode}`);

    // For English, we need to reset to original language completely
    if (languageCode === "en") {
      console.log("🇬🇧 Resetting to English by reloading the page.");

      // Delete the Google Translate cookie that stores the last language
      document.cookie =
        "googtrans=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";

      // A page reload is the most reliable way to clear Google Translate's state.
      // The `setLanguage` function has already set localStorage and a sessionStorage flag
      // to handle the reload gracefully and prevent re-translation.
      window.location.reload();

      return;
    }

    // For non-English languages (Sinhala/Tamil)
    const targetLanguage = languageCode;
    let attempts = 0;
    const maxAttempts = 15;

    const findCombo = () => {
      const combo = document.querySelector(
        ".goog-te-combo"
      ) as HTMLSelectElement;
      attempts++;

      if (combo) {
        console.log(
          `📍 Found combo, translating to ${targetLanguage} (attempt ${attempts})`
        );

        // Check if we're already at the target language
        if (combo.value === targetLanguage) {
          console.log(`✅ Already translated to ${targetLanguage}`);
          return;
        }

        // Set the target language
        combo.value = targetLanguage;
        combo.dispatchEvent(new Event("change", { bubbles: true }));

        // Additional events to ensure it triggers
        combo.dispatchEvent(new Event("input", { bubbles: true }));

        console.log(`✅ Translation triggered for: ${targetLanguage}`);
      } else if (attempts < maxAttempts) {
        console.log(
          `⏳ Combo not found yet, retrying... (${attempts}/${maxAttempts})`
        );
        setTimeout(findCombo, 300);
      } else {
        console.log("⚠️ Google Translate combo not found after all attempts");

        // Try alternative method: look for language links
        const langLink = document.querySelector(
          `a[onclick*="${targetLanguage}"]`
        );
        if (langLink) {
          console.log("🎯 Found language link, clicking...");
          (langLink as HTMLElement).click();
        }
      }
    };

    findCombo();
  };

  const setLanguage = (language: string) => {
    console.log(`🌐 Setting language to: ${language}`);

    // Prevent unnecessary translation if we're already in the target language
    const currentSavedLanguage = localStorage.getItem("mealbridge-language");
    if (currentSavedLanguage === language && !isSwitchingLanguage) {
      console.log(`✅ Already in ${language}, no change needed`);
      return;
    }

    setIsSwitchingLanguage(true);
    setIsTranslating(true);
    setCurrentLanguage(language);

    // Save language preference immediately
    localStorage.setItem("mealbridge-language", language);
    console.log(`💾 Saved language preference: ${language}`);

    // For English, we want to ensure clean state
    if (language === "en") {
      console.log("🇬🇧 Switching to English - will clean translate state");

      // Set a session flag to prevent auto-translation after page reload
      sessionStorage.setItem("mealbridge-switching-to-english", "true");
    }

    // Trigger translation if Google Translate is ready
    if (isGoogleTranslateReady) {
      setTimeout(() => triggerTranslation(language), 500);
    }

    // Reset translating state
    setTimeout(() => {
      setIsTranslating(false);
      setIsSwitchingLanguage(false);
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
