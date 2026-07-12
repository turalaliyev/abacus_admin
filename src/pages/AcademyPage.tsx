import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  Switch,
  Space,
  Card,
  Tabs,
  message,
  Spin,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useCrud } from '../hooks/useCrud'
import { PageHeader } from '../components/MediaUrlInput'
import { I18nInput, I18nRichText } from '../components/I18nFields'
import {
  academyDescriptionForForm,
  prepareI18nSave,
  rowToFormI18n,
  type I18nText,
} from '../lib/i18nForm'
import type { AcademyQuizQuestionRow, SiteSettings } from '../types/database'

const TOPICS = [
  { value: 'audit', label: 'Audit' },
  { value: 'tax', label: 'Vergi' },
  { value: 'accounting', label: 'Mühasibatlıq' },
  { value: 'hr', label: 'İnsan resursları' },
  { value: 'consulting', label: 'Konsaltinq' },
  { value: 'legal', label: 'Hüquq' },
  { value: 'procurement', label: 'Satınalma' },
]

const OPTION_LABELS = ['A', 'B', 'C', 'D']

function optionsToForm(options_i18n?: AcademyQuizQuestionRow['options_i18n']) {
  const out: Record<string, I18nText> = {}
  for (let i = 0; i < 4; i++) {
    out[`option_${i}_i18n`] = {
      az: options_i18n?.az?.[i] ?? '',
      en: options_i18n?.en?.[i] ?? '',
      ru: options_i18n?.ru?.[i] ?? '',
    }
  }
  return out
}

function formToOptions(values: Record<string, unknown>) {
  const options_i18n = {
    az: [] as string[],
    en: [] as string[],
    ru: [] as string[],
  }
  for (let i = 0; i < 4; i++) {
    const field = values[`option_${i}_i18n`] as I18nText | undefined
    options_i18n.az.push(field?.az?.trim() ?? '')
    options_i18n.en.push(field?.en?.trim() ?? '')
    options_i18n.ru.push(field?.ru?.trim() ?? '')
  }
  return options_i18n
}

function AcademyContentTab() {
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
        ...rowToFormI18n(data as never, ['academy_title']),
        academy_description_i18n: academyDescriptionForForm(data),
      })
    }
  }, [data, form])

  const save = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const payload = prepareI18nSave(values, ['academy_title', 'academy_description'])
      const { error } = await supabase.from('site_settings').update(payload).eq('id', 1)
      if (error) throw error
    },
    onSuccess: () => {
      message.success(t('settings.saved'))
      qc.invalidateQueries({ queryKey: ['site_settings'] })
    },
    onError: (e: Error) => message.error(e.message),
  })

  if (isLoading) return <Spin className="flex justify-center py-12" />

  return (
    <Card>
      <Form form={form} layout="vertical" onFinish={(v) => save.mutate(v)}>
        <p className="mb-3 text-xs text-slate-500">{t('common.contentLang')}</p>
        <Form.Item name="academy_title_i18n" label="Akademiya başlığı" rules={[{ required: true }]}>
          <I18nInput />
        </Form.Item>
        <Form.Item
          name="academy_description_i18n"
          label="Akademiya təsviri"
          rules={[
            {
              validator: async (_, val: { az?: string } | undefined) => {
                const text = (val?.az ?? '').replace(/<[^>]+>/g, '').trim()
                if (!text) return Promise.reject(new Error('Required'))
              },
            },
          ]}
        >
          <I18nRichText />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={save.isPending}>
          {t('common.save')}
        </Button>
      </Form>
    </Card>
  )
}

function QuizQuestionsTab() {
  const { t } = useTranslation()
  const { query, create, update, remove } = useCrud<AcademyQuizQuestionRow>({
    table: 'academy_quiz_questions',
    queryKey: ['academy_quiz_questions'],
  })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AcademyQuizQuestionRow | null>(null)
  const [form] = Form.useForm()

  const openModal = (row?: AcademyQuizQuestionRow) => {
    setEditing(row ?? null)
    form.setFieldsValue(
      row
        ? {
            ...rowToFormI18n(row as never, ['question']),
            ...optionsToForm(row.options_i18n),
            topic: row.topic,
            correct_index: row.correct_index,
            sort_order: row.sort_order,
            is_active: row.is_active,
          }
        : {
            topic: 'audit',
            correct_index: 0,
            sort_order: (query.data?.length ?? 0) + 1,
            is_active: true,
            ...optionsToForm(),
          },
    )
    setOpen(true)
  }

  const onSave = async () => {
    const values = await form.validateFields()
    const questionPayload = prepareI18nSave(values, ['question'])
    const payload = {
      ...questionPayload,
      topic: values.topic,
      correct_index: values.correct_index,
      sort_order: values.sort_order,
      is_active: values.is_active,
      options_i18n: formToOptions(values),
    }
    if (editing) await update.mutateAsync({ id: editing.id, ...payload })
    else await create.mutateAsync(payload)
    setOpen(false)
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          {t('common.add')}
        </Button>
      </div>
      <Table
        loading={query.isLoading}
        dataSource={query.data}
        rowKey="id"
        columns={[
          {
            title: 'Sual',
            dataIndex: 'question',
            render: (_, row) => row.question_i18n?.az || row.question,
          },
          {
            title: 'Mövzu',
            dataIndex: 'topic',
            width: 140,
            render: (topic) => TOPICS.find((x) => x.value === topic)?.label ?? topic,
          },
          { title: t('common.order'), dataIndex: 'sort_order', width: 70 },
          {
            title: t('common.active'),
            dataIndex: 'is_active',
            width: 70,
            render: (v) => (v ? t('common.yes') : t('common.no')),
          },
          {
            title: '',
            width: 100,
            render: (_, row) => (
              <Space>
                <Button icon={<EditOutlined />} size="small" onClick={() => openModal(row)} />
                <Button icon={<DeleteOutlined />} size="small" danger onClick={() => remove.mutate(row.id)} />
              </Space>
            ),
          },
        ]}
      />
      <Modal
        title={editing ? t('common.edit') : t('common.add')}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onSave}
        width={640}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <p className="mb-3 text-xs text-slate-500">{t('common.contentLang')}</p>
          <Form.Item name="question_i18n" label="Sual" rules={[{ required: true }]}>
            <I18nInput />
          </Form.Item>
          {OPTION_LABELS.map((label, index) => (
            <Form.Item
              key={label}
              name={`option_${index}_i18n`}
              label={`Variant ${label}`}
              rules={[{ required: true }]}
            >
              <I18nInput />
            </Form.Item>
          ))}
          <Form.Item name="correct_index" label="Düzgün cavab" rules={[{ required: true }]}>
            <Select
              options={OPTION_LABELS.map((label, index) => ({ value: index, label: `Variant ${label}` }))}
            />
          </Form.Item>
          <Form.Item name="topic" label="Mövzu" rules={[{ required: true }]}>
            <Select options={TOPICS} />
          </Form.Item>
          <Form.Item name="sort_order" label={t('common.order')}>
            <InputNumber className="w-full" min={0} />
          </Form.Item>
          <Form.Item name="is_active" label={t('common.active')} valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export function AcademyPage() {
  const { t } = useTranslation()

  return (
    <div>
      <PageHeader title={t('nav.academy')} subtitle="Akademiya məzmunu və bilik testi sualları" />
      <Tabs
        items={[
          { key: 'content', label: 'Məzmun', children: <AcademyContentTab /> },
          { key: 'quiz', label: 'Test sualları', children: <QuizQuestionsTab /> },
        ]}
      />
    </div>
  )
}
