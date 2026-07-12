import { useState } from 'react'
import { Input, Segmented } from 'antd'
import type { I18nText, Locale } from '../lib/i18nContent'
import { LOCALES } from '../lib/i18nContent'
import { RichTextEditor } from './RichTextEditor'

const { TextArea } = Input

function LangTabs({
  lang,
  onLangChange,
}: {
  lang: Locale
  onLangChange: (l: Locale) => void
}) {
  return (
    <Segmented
      size="small"
      className="mb-2"
      options={LOCALES.map((l) => ({ value: l.code, label: l.label }))}
      value={lang}
      onChange={(k) => onLangChange(k as Locale)}
    />
  )
}

export function I18nInput({
  value,
  onChange,
}: {
  value?: I18nText
  onChange?: (v: I18nText) => void
}) {
  const [lang, setLang] = useState<Locale>('az')
  const v = value ?? { az: '', en: '', ru: '' }

  return (
    <div>
      <LangTabs lang={lang} onLangChange={setLang} />
      <Input
        value={v[lang] ?? ''}
        onChange={(e) => onChange?.({ ...v, [lang]: e.target.value })}
      />
    </div>
  )
}

export function I18nTextArea({
  value,
  onChange,
  rows = 4,
}: {
  value?: I18nText
  onChange?: (v: I18nText) => void
  rows?: number
}) {
  const [lang, setLang] = useState<Locale>('az')
  const v = value ?? { az: '', en: '', ru: '' }

  return (
    <div>
      <LangTabs lang={lang} onLangChange={setLang} />
      <TextArea
        rows={rows}
        value={v[lang] ?? ''}
        onChange={(e) => onChange?.({ ...v, [lang]: e.target.value })}
      />
    </div>
  )
}

/** Paragraphs stored as plain text per language (blank line between paragraphs). */
export function I18nParagraphsInput({
  value,
  onChange,
  rows = 6,
}: {
  value?: I18nText
  onChange?: (v: I18nText) => void
  rows?: number
}) {
  return <I18nTextArea value={value} onChange={onChange} rows={rows} />
}

/** Rich HTML content per language (bold, lists, links, etc.). */
export function I18nRichText({
  value,
  onChange,
}: {
  value?: I18nText
  onChange?: (v: I18nText) => void
}) {
  const [lang, setLang] = useState<Locale>('az')
  const v = value ?? { az: '', en: '', ru: '' }

  return (
    <div>
      <LangTabs lang={lang} onLangChange={setLang} />
      <RichTextEditor
        key={lang}
        value={v[lang] ?? ''}
        onChange={(html) => onChange?.({ ...v, [lang]: html })}
      />
    </div>
  )
}
