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

          // Add a global function to force reset to English
          (window as any).resetToEnglish = () => {
            console.log("🔄 Global resetToEnglish function called");

            // Method 1: Reset combo to empty value
            const combo = document.querySelector(
              ".goog-te-combo"
            ) as HTMLSelectElement;
            if (combo) {
              combo.value = "";
              combo.dispatchEvent(new Event("change", { bubbles: true }));
              combo.dispatchEvent(new Event("input", { bubbles: true }));
              console.log("✅ Combo reset to empty value");
            }

            // Method 2: Remove Google Translate hash from URL
            const currentUrl = window.location.href;
            if (currentUrl.includes("#googtrans")) {
              const cleanUrl = currentUrl.split("#googtrans")[0];
              window.history.replaceState({}, document.title, cleanUrl);
              console.log("✅ Removed Google Translate hash from URL");
            }

            // Method 3: Try to call Google's internal restore function
            if ((window as any).google?.translate?.TranslateElement) {
              try {
                // Look for restore functions in the global scope
                const restoreFuncs = Object.keys(window).filter(
                  (key) =>
                    key.includes("restore") ||
                    key.includes("orig") ||
                    key.includes("Original")
                );
                restoreFuncs.forEach((funcName) => {
                  try {
                    if (typeof (window as any)[funcName] === "function") {
                      console.log(`🔧 Calling restore function: ${funcName}`);
                      (window as any)[funcName]();
                    }
                  } catch (e) {
                    // Ignore errors from trying restore functions
                  }
                });
              } catch (error) {
                // Ignore errors
              }
            }

            // Method 4: Click any "Show original" or restore elements
            const restoreSelectors = [
              'a[onclick*="restoreOrigText"]',
              'span[onclick*="restoreOrigText"]',
              ".goog-te-menu-value span:first-child",
              'a[href*="javascript:doGoogleLanguageTranslator"]',
            ];

            restoreSelectors.forEach((selector) => {
              const element = document.querySelector(selector);
              if (
                element &&
                (element.textContent?.includes("Show original") ||
                  element.textContent?.includes("English") ||
                  element.getAttribute("onclick")?.includes("restoreOrigText"))
              ) {
                console.log(`🎯 Clicking restore element: ${selector}`);
                (element as HTMLElement).click();
              }
            });

            // Method 5: Force re-initialization as last resort
            setTimeout(() => {
              const currentCombo = document.querySelector(
                ".goog-te-combo"
              ) as HTMLSelectElement;
              if (currentCombo && currentCombo.value !== "") {
                console.log("⚠️ All methods failed, may need page reload");
                // This will be handled by the calling function
              }
            }, 500);
          };
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
    if (isGoogleTranslateLoaded && !hasInitialTranslation) {
      setHasInitialTranslation(true);

      // Check if we just switched to English (session flag)
      const justSwitchedToEnglish = sessionStorage.getItem(
        "mealbridge-switching-to-english"
      );
      if (justSwitchedToEnglish) {
        console.log(
          "🇬🇧 Recently switched to English, skipping auto-translation and cleaning session"
        );
        sessionStorage.removeItem("mealbridge-switching-to-english");

        // Ensure we're in clean English state
        const hasTranslateHash = window.location.href.includes("#googtrans");
        if (hasTranslateHash) {
          console.log("🧹 Cleaning up translate hash for English");
          const cleanUrl = window.location.href.split("#googtrans")[0];
          window.history.replaceState({}, document.title, cleanUrl);
        }
        return;
      }

      // Check the current state - if currentLanguage is English, don't auto-translate
      console.log(`📍 Current language state: ${currentLanguage}`);

      if (currentLanguage === "en") {
        console.log("🇬🇧 Current language is English, ensuring clean state");
        const hasTranslateHash = window.location.href.includes("#googtrans");
        if (hasTranslateHash) {
          console.log("🧹 Cleaning up translate hash for English");
          const cleanUrl = window.location.href.split("#googtrans")[0];
          window.history.replaceState({}, document.title, cleanUrl);
        }
        return;
      }

      // Only auto-translate if we have a saved non-English language AND currentLanguage matches it
      const savedLanguage = localStorage.getItem("mealbridge-language");
      const hasTranslateHash = window.location.href.includes("#googtrans");

      // Double-check: if saved language is English but currentLanguage is not, update currentLanguage
      if (savedLanguage === "en" && currentLanguage !== "en") {
        console.log(
          "🔧 Correcting language state mismatch - setting to English"
        );
        setCurrentLanguage("en");
        return;
      }

      // Only trigger translation if:
      // 1. We have a saved non-English language
      // 2. The current language state matches the saved language
      // 3. The page doesn't already have a translation active
      if (
        savedLanguage &&
        savedLanguage !== "en" &&
        savedLanguage === currentLanguage &&
        !hasTranslateHash
      ) {
        setTimeout(() => {
          console.log(`🔄 Initial auto-translation to: ${savedLanguage}`);
          triggerTranslation(savedLanguage);
        }, 1000);
      }
    }
  }, [isGoogleTranslateLoaded, hasInitialTranslation, currentLanguage]);

  const triggerTranslation = (languageCode: string) => {
    if (!isGoogleTranslateReady) {
      return;
    }

    console.log(`🔄 Triggering translation to: ${languageCode}`);

    // For English, we need to reset to original language completely
    if (languageCode === "en") {
      console.log("🇬🇧 Resetting to English (original language)");

      // First, update localStorage to ensure persistence
      localStorage.setItem("mealbridge-language", "en");

      // Method 1: Try to use Google Translate combo to reset
      let attempts = 0;
      const maxAttempts = 10;

      const resetToEnglish = () => {
        const combo = document.querySelector(
          ".goog-te-combo"
        ) as HTMLSelectElement;
        attempts++;

        if (combo) {
          console.log(
            `📍 Found combo, resetting to English (attempt ${attempts})`
          );

          // Check if already in original state
          if (combo.value === "" || combo.value === "en") {
            console.log("✅ Already in English state");
            return;
          }

          // Reset to original language (empty value)
          combo.value = "";
          combo.dispatchEvent(new Event("change", { bubbles: true }));

          // Also try clicking the first option which should be original
          const firstOption = combo.querySelector(
            'option[value=""]'
          ) as HTMLOptionElement;
          if (firstOption) {
            firstOption.selected = true;
            combo.dispatchEvent(new Event("change", { bubbles: true }));
          }

          console.log("✅ Google Translate reset to original language");

          // If there's still a hash after reset, clean URL
          setTimeout(() => {
            const currentUrl = window.location.href;
            if (currentUrl.includes("#googtrans")) {
              const cleanUrl = currentUrl.split("#googtrans")[0];
              window.history.replaceState({}, document.title, cleanUrl);
            }
          }, 1000);
        } else if (attempts < maxAttempts) {
          console.log(
            `⏳ Combo not found yet, retrying reset... (${attempts}/${maxAttempts})`
          );
          setTimeout(resetToEnglish, 300);
        } else {
          // Fallback: Clean URL if combo method fails
          console.log("⚠️ Combo reset failed, using URL cleanup fallback");
          const currentUrl = window.location.href;
          if (currentUrl.includes("#googtrans")) {
            console.log("🔄 Removing Google Translate hash and reloading...");
            const cleanUrl = currentUrl.split("#googtrans")[0];
            window.location.replace(cleanUrl);
          }
        }
      };

      resetToEnglish();
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
    if (currentSavedLanguage === language) {
      console.log(`✅ Already in ${language}, no change needed`);
      return;
    }

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
