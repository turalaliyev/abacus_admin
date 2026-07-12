export type Locale = 'az' | 'en' | 'ru'

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'az', label: 'AZ' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
]

export type I18nText = Partial<Record<Locale, string>>
export type I18nParagraphs = Partial<Record<Locale, string[]>>

export function mergeI18n(i18n: I18nText | undefined, legacy: string): I18nText {
  return {
    az: i18n?.az?.trim() || legacy,
    en: i18n?.en?.trim() || '',
    ru: i18n?.ru?.trim() || '',
  }
}

export function mergeParagraphsI18n(
  i18n: I18nParagraphs | undefined,
  legacy: string[],
): I18nParagraphs {
  return {
    az: i18n?.az?.length ? i18n.az : legacy,
    en: i18n?.en ?? [],
    ru: i18n?.ru ?? [],
  }
}

export function paragraphsToText(paragraphs: string[] | undefined): string {
  return (paragraphs ?? []).join('\n\n')
}

export function textToParagraphs(text: string): string[] {
  return text
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean)
}

export function applyTextI18n(
  values: Record<string, unknown>,
  field: string,
): Record<string, unknown> {
  const i18n = (values[`${field}_i18n`] as I18nText | undefined) ?? {}
  const az = i18n.az?.trim() ?? String(values[field] ?? '')
  return {
    [`${field}_i18n`]: { ...i18n, az },
    [field]: az,
  }
}

export function applyParagraphsI18n(
  values: Record<string, unknown>,
  field: string,
): Record<string, unknown> {
  const i18nKey = `${field}_i18n`
  const raw = values[i18nKey] as Record<Locale, string> | undefined
  const i18n: I18nParagraphs = {
    az: textToParagraphs(raw?.az ?? ''),
    en: textToParagraphs(raw?.en ?? ''),
    ru: textToParagraphs(raw?.ru ?? ''),
  }
  if (!i18n.az?.length) {
    i18n.az = textToParagraphs(String(values[field] ?? ''))
  }
  return {
    [i18nKey]: i18n,
    [field]: i18n.az,
  }
}

export function rowToFormI18n<T extends Record<string, unknown>>(
  row: T,
  fields: string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...row }
  for (const field of fields) {
    const i18nKey = `${field}_i18n`
    out[i18nKey] = mergeI18n(row[i18nKey] as I18nText | undefined, String(row[field] ?? ''))
  }
  return out
}

export function prepareI18nSave(
  values: Record<string, unknown>,
  textFields: string[],
  paragraphFields: string[] = [],
): Record<string, unknown> {
  let payload = { ...values }
  for (const field of textFields) {
    payload = { ...payload, ...applyTextI18n(payload, field) }
  }
  for (const field of paragraphFields) {
    payload = { ...payload, ...applyParagraphsI18n(payload, field) }
  }
  return payload
}

export function formParagraphsI18n(
  i18n: I18nParagraphs | undefined,
  legacy: string[],
): I18nText {
  const merged = mergeParagraphsI18n(i18n, legacy)
  return {
    az: paragraphsToText(merged.az),
    en: paragraphsToText(merged.en),
    ru: paragraphsToText(merged.ru),
  }
}

/** Load academy description for rich-text editor (migrates legacy paragraphs if needed). */
export function academyDescriptionForForm(row: {
  academy_description?: string
  academy_description_i18n?: I18nText
  academy_paragraphs?: string[]
  academy_paragraphs_i18n?: I18nParagraphs
}): I18nText {
  const html = mergeI18n(row.academy_description_i18n, row.academy_description ?? '')
  if (html.az?.replace(/<[^>]+>/g, '').trim()) return html

  const paragraphs = mergeParagraphsI18n(row.academy_paragraphs_i18n, row.academy_paragraphs ?? [])
  return {
    az: (paragraphs.az ?? []).map((p) => `<p>${p}</p>`).join(''),
    en: (paragraphs.en ?? []).map((p) => `<p>${p}</p>`).join(''),
    ru: (paragraphs.ru ?? []).map((p) => `<p>${p}</p>`).join(''),
  }
}
