import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import az from './locales/az.json'
import en from './locales/en.json'
import ru from './locales/ru.json'
import type { Locale } from './lib/i18nContent'

const saved = localStorage.getItem('abacus-admin-locale') as Locale | null

void i18n.use(initReactI18next).init({
  resources: {
    az: { translation: az },
    en: { translation: en },
    ru: { translation: ru },
  },
  lng: saved && ['az', 'en', 'ru'].includes(saved) ? saved : 'az',
  fallbackLng: 'az',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('abacus-admin-locale', lng)
})

export default i18n
