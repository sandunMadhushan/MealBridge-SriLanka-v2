import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const TranslateDebugger: React.FC = () => {
  const { currentLanguage, isGoogleTranslateLoaded, isTranslating } =
    useLanguage();
  const [comboFound, setComboFound] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      const combo = document.querySelector(".goog-te-combo");
      const google = (window as any).google?.translate?.TranslateElement;

      setComboFound(!!combo);
      setGoogleReady(!!google);
    };

    // Check every 3 seconds to reduce spam
    const interval = setInterval(checkStatus, 3000);
    checkStatus(); // Initial check

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="translate-debugger">
      <div>🌐 Lang: {currentLanguage}</div>
      <div>📦 Loaded: {isGoogleTranslateLoaded ? "✅" : "❌"}</div>
      <div>🔧 Google API: {googleReady ? "✅" : "❌"}</div>
      <div>🎛️ Combo: {comboFound ? "✅" : "❌"}</div>
      <div>🔄 Translating: {isTranslating ? "⏳" : "⭕"}</div>
    </div>
  );
};

export default TranslateDebugger;
