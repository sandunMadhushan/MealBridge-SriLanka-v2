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
    // console.log("Loading Google Translate...");

    // Prevent conflicts with existing global function
    if (!(window as any).googleTranslateElementInit) {
      (window as any).googleTranslateElementInit = () => {
        // console.log("Google Translate initializing...");

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
          // console.log("✅ Google Translate initialized successfully");

          // Hide the Google Translate banner after a short delay
          setTimeout(() => {
            const banner = document.querySelector(".goog-te-banner-frame");
            const ftab = document.querySelector(".goog-te-ftab");
            if (banner) {
              (banner as HTMLElement).style.display = "none";
            }
            if (ftab) {
              (ftab as HTMLElement).style.display = "none";
            }
            // Remove any top margin Google Translate might add
            document.body.style.top = "0";
            document.body.style.marginTop = "0";
          }, 1000);
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
        console.log(
          `🎯 Found combo on attempt ${attempts}, triggering translation...`
        );
        combo.value = languageCode;
        combo.dispatchEvent(new Event("change", { bubbles: true }));
        console.log(`✅ Translation triggered for: ${languageCode}`);
      } else if (attempts < maxAttempts) {
        console.log(
          `⏳ Combo not ready yet (${attempts}/${maxAttempts}), waiting...`
        );
        setTimeout(findCombo, 300);
      } else {
        console.log("⚠️ Google Translate combo not found after all attempts");

        // Try alternative methods
        console.log("🔄 Trying alternative translation methods...");

        // Method 1: Try to find clickable language links
        const langLink = document.querySelector(
          `a[onclick*="${languageCode}"]`
        );
        if (langLink) {
          console.log("🎯 Found language link, clicking...");
          (langLink as HTMLElement).click();
          console.log(`✅ Language link clicked for: ${languageCode}`);
          return;
        }

        // Method 2: Try to trigger Google Translate directly
        if ((window as any).google?.translate?.TranslateElement) {
          console.log("🎯 Trying direct Google Translate API...");
          try {
            // Force page reload with target language
            const url = new URL(window.location.href);
            url.searchParams.set("sl", "en");
            url.searchParams.set("tl", languageCode);
            console.log(`✅ Will try URL-based translation: ${url.toString()}`);
          } catch (error) {
            console.log("❌ Direct API method failed:", error);
          }
        }

        // Debug: Let's see what elements are actually created
        const allGoogleElements =
          document.querySelectorAll('[class*="goog-te"]');
        console.log(
          "🔍 Available Google Translate elements:",
          Array.from(allGoogleElements).map((el) => el.className)
        );

        // Show all possible selectors
        const allSelects = document.querySelectorAll("select");
        console.log(
          "🔍 All select elements:",
          Array.from(allSelects).map((sel) => `${sel.className} - ${sel.id}`)
        );
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
