import React from "react";
import { GlobeAltIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../context/LanguageContext";
import { supportedLanguages } from "../utils/languageUtils";
import { cn } from "../utils/cn";

interface LanguageSelectorProps {
  className?: string;
  showLabel?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = "",
  showLabel = true,
}) => {
  const {
    currentLanguage,
    setLanguage,
    isTranslating,
    isGoogleTranslateLoaded,
  } = useLanguage();

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage);
  };

  if (!isGoogleTranslateLoaded) {
    return (
      <div className={cn("flex items-center space-x-2 opacity-50", className)}>
        {showLabel && (
          <>
            <GlobeAltIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">Loading translator...</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {showLabel && (
        <>
          <GlobeAltIcon className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Language:</span>
        </>
      )}

      <div className="relative">
        <select
          value={currentLanguage}
          onChange={handleLanguageChange}
          disabled={isTranslating}
          title="Select Language"
          aria-label="Select Language"
          className={cn(
            "appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm font-medium text-gray-700",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "hover:border-gray-400 transition-colors",
            isTranslating && "animate-pulse"
          )}
        >
          {supportedLanguages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.flag} {language.nativeName}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {isTranslating && (
        <div className="flex items-center space-x-1 text-sm text-primary-600">
          <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Translating...</span>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
