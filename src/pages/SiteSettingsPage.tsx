import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Form, Input, Button, Card, message, Spin } from 'antd'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { PageHeader } from '../components/MediaUrlInput'
import { I18nInput, I18nTextArea, I18nParagraphsInput } from '../components/I18nFields'
import { formParagraphsI18n, prepareI18nSave, rowToFormI18n } from '../lib/i18nForm'
import type { SiteSettings } from '../types/database'

export function SiteSettingsPage() {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['site_settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single()
      if (error) throw error
      return data as SiteSettings
    },
  })

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        ...rowToFormI18n(data as never, [
          'name',
          'tagline',
          'hero_badge',
          'hero_title',
          'hero_subtitle',
          'about_title',
        ]),
        about_paragraphs_i18n: formParagraphsI18n(data.about_paragraphs_i18n, data.about_paragraphs),
      })
    }
  }, [data, form])

  const save = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const payload = prepareI18nSave(
        values,
        ['name', 'tagline', 'hero_badge', 'hero_title', 'hero_subtitle', 'about_title'],
        ['about_paragraphs'],
      )
      const { error } = await supabase.from('site_settings').update(payload).eq('id', 1)
      if (error) throw error
    },
    onSuccess: () => {
      message.success(t('settings.saved'))
      qc.invalidateQueries({ queryKey: ['site_settings'] })
    },
    onError: (e: Error) => message.error(e.message),
  })

  if (isLoading) return <Spin className="flex justify-center py-20" size="large" />

  return (
    <div>
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />
      <Form form={form} layout="vertical" onFinish={(v) => save.mutate(v)}>
        <Card title={t('settings.company')} className="mb-4">
          <p className="mb-3 text-xs text-slate-500">{t('common.contentLang')}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Form.Item name="name_i18n" label={t('common.title')} rules={[{ required: true }]}>
              <I18nInput />
            </Form.Item>
            <Form.Item name="tagline_i18n" label="Slogan" rules={[{ required: true }]}>
              <I18nInput />
            </Form.Item>
            <Form.Item name="phone" label="Telefon" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="E-poçt" rules={[{ required: true, type: 'email' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="address" label="Ünvan" className="md:col-span-2" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </div>
        </Card>

        <Card title={t('settings.social')} className="mb-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Form.Item name="facebook_url" label="Facebook"><Input /></Form.Item>
            <Form.Item name="instagram_url" label="Instagram"><Input /></Form.Item>
            <Form.Item name="linkedin_url" label="LinkedIn"><Input /></Form.Item>
            <Form.Item name="whatsapp_url" label="WhatsApp"><Input /></Form.Item>
          </div>
        </Card>

        <Card title={t('settings.hero')} className="mb-4">
          <Form.Item name="hero_badge_i18n" label="Badge"><I18nInput /></Form.Item>
          <Form.Item name="hero_title_i18n" label={t('common.title')}><I18nInput /></Form.Item>
          <Form.Item name="hero_subtitle_i18n" label={t('common.description')}><I18nTextArea rows={3} /></Form.Item>
          <p className="text-xs text-slate-500">{t('settings.heroHint')}</p>
        </Card>

        <Card title={t('settings.about')} className="mb-4">
          <Form.Item name="about_title_i18n" label={t('common.title')}><I18nInput /></Form.Item>
          <Form.Item name="about_paragraphs_i18n" label={t('settings.paragraphsHint')}>
            <I18nParagraphsInput rows={8} />
          </Form.Item>
        </Card>

        <Button type="primary" htmlType="submit" loading={save.isPending} size="large">
          {t('common.save')}
        </Button>
      </Form>
    </div>
  )
}
