export type Locale = 'az' | 'en' | 'ru'

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'az', label: 'AZ' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
]

export type I18nText = Partial<Record<Locale, string>>
