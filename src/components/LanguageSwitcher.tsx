import { LOCALES } from '../lib/i18nContent'
import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => void i18n.changeLanguage(code)}
          className={`rounded px-2 py-0.5 text-xs font-semibold transition-colors ${
            i18n.language.startsWith(code)
              ? 'bg-gold-500 text-navy-950'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
