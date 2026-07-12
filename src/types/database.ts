import type { I18nText, I18nParagraphs } from '../lib/i18nForm'

export type MediaAsset = {
  id: string
  key: string
  url: string
  media_type: 'image' | 'video'
  alt_text: string | null
}

export type SiteSettings = {
  id: number
  name: string
  tagline: string
  phone: string
  email: string
  address: string
  facebook_url: string
  instagram_url: string
  linkedin_url: string
  whatsapp_url: string
  hero_badge: string
  hero_title: string
  hero_subtitle: string
  about_title: string
  about_paragraphs: string[]
  name_i18n?: I18nText
  tagline_i18n?: I18nText
  hero_badge_i18n?: I18nText
  hero_title_i18n?: I18nText
  hero_subtitle_i18n?: I18nText
  about_title_i18n?: I18nText
  about_paragraphs_i18n?: I18nParagraphs
  academy_title: string
  academy_description: string
  academy_paragraphs: string[]
  academy_title_i18n?: I18nText
  academy_description_i18n?: I18nText
  academy_paragraphs_i18n?: I18nParagraphs
}

export type NavItem = {
  id: string
  label: string
  label_i18n?: I18nText
  href: string
  parent_id: string | null
  sort_order: number
  is_visible: boolean
}

export type TeamMember = {
  id: string
  name: string
  role: string
  name_i18n?: I18nText
  role_i18n?: I18nText
  image_url: string
  sort_order: number
  is_published: boolean
}

export type Service = {
  id: string
  slug: string
  title: string
  description: string
  title_i18n?: I18nText
  description_i18n?: I18nText
  icon: string
  image_url: string
  sort_order: number
  is_published: boolean
}

export type Stat = {
  id: string
  value: number
  suffix: string
  label: string
  label_i18n?: I18nText
  sort_order: number
}

export type Partner = {
  id: string
  name: string
  name_i18n?: I18nText
  logo_url: string
  sort_order: number
  is_published: boolean
}

export type WhyUsItem = {
  id: string
  title: string
  description: string
  title_i18n?: I18nText
  description_i18n?: I18nText
  sort_order: number
}

export type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  title_i18n?: I18nText
  excerpt_i18n?: I18nText
  content_i18n?: I18nText
  category_i18n?: I18nText
  post_type: 'xeberler' | 'qanunvericilik'
  cover_image_url: string
  published_at: string
  is_published: boolean
}

export type AcademyQuizQuestionRow = {
  id: string
  topic: 'audit' | 'tax' | 'accounting' | 'hr' | 'consulting' | 'legal' | 'procurement'
  question: string
  question_i18n?: I18nText
  options_i18n: { az?: string[]; en?: string[]; ru?: string[] }
  correct_index: number
  is_active: boolean
  sort_order: number
}

export type AcademyCourse = {
  id: string
  track: 'maliyye' | 'insan-resurslari' | 'satin-alma'
  name: string
  duration: string
  name_i18n?: I18nText
  duration_i18n?: I18nText
  image_url: string
  sort_order: number
  is_published: boolean
}
