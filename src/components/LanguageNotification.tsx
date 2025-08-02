import React, { useEffect, useState } from "react";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../context/LanguageContext";
import { formatLanguageName } from "../utils/languageUtils";

const LanguageNotification: React.FC = () => {
  const { currentLanguage, isTranslating } = useLanguage();
  const [showNotification, setShowNotification] = useState(false);
  const [previousLanguage, setPreviousLanguage] = useState(currentLanguage);

  useEffect(() => {
    if (currentLanguage !== previousLanguage && !isTranslating) {
      setShowNotification(true);
      setPreviousLanguage(currentLanguage);

      // Auto-hide notification after 3 seconds
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [currentLanguage, isTranslating, previousLanguage]);

  if (!showNotification || isTranslating) {
    return null;
  }

  return (
    <div className="language-notification">
      <div className="flex items-center space-x-2">
        <CheckCircleIcon className="w-5 h-5 text-white" />
        <span className="text-sm font-medium">
          Language changed to {formatLanguageName(currentLanguage, false)}
        </span>
        <button
          onClick={() => setShowNotification(false)}
          className="ml-2 text-white hover:text-gray-200"
          title="Close notification"
          aria-label="Close language change notification"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default LanguageNotification;
