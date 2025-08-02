// Alternative Google Translate implementation for better reliability
export class GoogleTranslateService {
  private static instance: GoogleTranslateService;
  private isInitialized = false;
  private callbacks: Array<() => void> = [];

  static getInstance(): GoogleTranslateService {
    if (!GoogleTranslateService.instance) {
      GoogleTranslateService.instance = new GoogleTranslateService();
    }
    return GoogleTranslateService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Remove existing script if any
      const existingScript = document.getElementById("google-translate-script");
      if (existingScript) {
        existingScript.remove();
      }

      // Clean up existing translate elements
      const existingElements = document.querySelectorAll(
        ".goog-te-gadget, .goog-te-banner-frame"
      );
      existingElements.forEach((el) => el.remove());

      // Add the script
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;

      script.onload = () => {
        console.log("Google Translate script loaded");
        resolve();
      };

      script.onerror = () => {
        console.error("Failed to load Google Translate script");
        reject(new Error("Failed to load Google Translate script"));
      };

      // Set up the callback
      (window as any).googleTranslateElementInit = () => {
        try {
          console.log("Initializing Google Translate Element...");

          const translateElement = new (
            window as any
          ).google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,si,ta",
              layout: (window as any).google.translate.TranslateElement
                .InlineLayout.SIMPLE,
              autoDisplay: false,
              multilanguagePage: true,
            },
            "google-translate-element"
          );

          this.isInitialized = true;
          console.log("Google Translate initialized successfully");

          // Execute any pending callbacks
          this.callbacks.forEach((callback) => callback());
          this.callbacks = [];
        } catch (error) {
          console.error("Error initializing Google Translate:", error);
          reject(error);
        }
      };

      document.head.appendChild(script);
    });
  }

  translateTo(languageCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const attemptTranslation = () => {
        console.log(`Attempting to translate to: ${languageCode}`);

        let attempts = 0;
        const maxAttempts = 10;

        // Wait for the widget to be ready
        const checkWidget = () => {
          attempts++;
          console.log(`Translation attempt ${attempts}/${maxAttempts}`);

          const combo = document.querySelector(
            ".goog-te-combo"
          ) as HTMLSelectElement;
          if (combo) {
            console.log("Found translate combo element");
            console.log(
              "Available options:",
              Array.from(combo.options).map((opt) => ({
                value: opt.value,
                text: opt.text,
              }))
            );

            // Check if the target language is available
            const hasTargetLanguage = Array.from(combo.options).some(
              (opt) => opt.value === languageCode
            );
            if (!hasTargetLanguage) {
              console.error(
                `Language ${languageCode} not available in options`
              );
              reject(new Error(`Language ${languageCode} not available`));
              return;
            }

            // Set the value
            const oldValue = combo.value;
            combo.value = languageCode;

            if (combo.value !== languageCode) {
              console.error(
                `Failed to set combo value to ${languageCode}, current value: ${combo.value}`
              );
              reject(new Error(`Failed to set language to ${languageCode}`));
              return;
            }

            // Trigger change events with more comprehensive event handling
            const triggerEvent = (eventType: string) => {
              const event = new Event(eventType, {
                bubbles: true,
                cancelable: true,
              });
              Object.defineProperty(event, "target", {
                value: combo,
                enumerable: true,
              });
              combo.dispatchEvent(event);
            };

            // Try multiple event types
            ["input", "change", "click"].forEach(triggerEvent);

            // Also try to trigger Google's internal handlers
            if ((combo as any).onchange) {
              (combo as any).onchange();
            }

            console.log(
              `Translation triggered for: ${languageCode} (was: ${oldValue})`
            );

            // Wait a bit to see if translation actually happens
            setTimeout(() => {
              const isTranslated =
                document.querySelector(".goog-te-balloon") ||
                document.body.classList.contains("translated-ltr") ||
                document.body.classList.contains("translated-rtl") ||
                combo.value === languageCode;

              if (isTranslated) {
                console.log("Translation appears to be successful");
                resolve();
              } else {
                console.warn("Translation may not have taken effect");
                resolve(); // Still resolve as we triggered the event
              }
            }, 1000);
          } else if (attempts < maxAttempts) {
            console.log("Combo element not found, retrying in 500ms...");
            setTimeout(checkWidget, 500);
          } else {
            console.error("Max attempts reached, combo element not found");
            reject(
              new Error(
                "Google Translate combo element not found after multiple attempts"
              )
            );
          }
        };

        checkWidget();
      };

      if (this.isInitialized) {
        setTimeout(attemptTranslation, 100);
      } else {
        console.log("Service not initialized, adding to callback queue");
        this.callbacks.push(() => {
          setTimeout(attemptTranslation, 500);
        });
      }
    });
  }

  onReady(callback: () => void): void {
    if (this.isInitialized) {
      callback();
    } else {
      this.callbacks.push(callback);
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}
