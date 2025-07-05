// src/hooks/useTranslation.ts
import { useEffect, useState } from 'react';
import { translations } from './translations';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useTranslation() {
  const [language, setLanguage] = useState<'en' | 'he'>('en');

  useEffect(() => {
    AsyncStorage.getItem('language').then((lang) => {
      if (lang === 'he' || lang === 'en') {
        setLanguage(lang);
      }
    });
  }, []);

  const t = (key: keyof typeof translations['en']) => translations[language][key] || key;

  return { t, language, setLanguage };
}