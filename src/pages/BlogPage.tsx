import { useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, Switch, DatePicker, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { useCrud } from '../hooks/useCrud'
import { PageHeader, MediaUrlInput } from '../components/MediaUrlInput'
import { I18nInput, I18nTextArea } from '../components/I18nFields'
import { prepareI18nSave, rowToFormI18n } from '../lib/i18nForm'
import type { BlogPost } from '../types/database'

export function BlogPage() {
  const { t } = useTranslation()
  const { query, create, update, remove } = useCrud<BlogPost>({
    table: 'blog_posts',
    queryKey: ['blog_posts'],
    orderBy: { column: 'published_at', ascending: false },
  })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [form] = Form.useForm()

  const openModal = (row?: BlogPost) => {
    setEditing(row ?? null)
    form.setFieldsValue(
      row
        ? { ...rowToFormI18n(row as never, ['title', 'excerpt', 'content', 'category']), published_at: dayjs(row.published_at) }
        : { post_type: 'xeberler', is_published: true, published_at: dayjs() },
    )
    setOpen(true)
  }

  const onSave = async () => {
    const values = await form.validateFields()
    const payload = {
      ...prepareI18nSave(values, ['title', 'excerpt', 'content', 'category']),
      published_at: values.published_at?.toISOString?.() ?? new Date().toISOString(),
    }
    if (editing) await update.mutateAsync({ id: editing.id, ...payload })
    else await create.mutateAsync(payload)
    setOpen(false)
  }

  return (
    <div>
      <PageHeader title={t('nav.blog')} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>{t('common.add')}</Button>} />
      <Table
        loading={query.isLoading}
        dataSource={query.data}
        rowKey="id"
        columns={[
          { title: t('common.title'), dataIndex: 'title', ellipsis: true },
          { title: 'Kateqoriya', dataIndex: 'category', width: 120 },
          { title: 'Tip', dataIndex: 'post_type', width: 120 },
          { title: 'Tarix', dataIndex: 'published_at', width: 120, render: (d) => dayjs(d).format('DD.MM.YYYY') },
          { title: t('common.active'), dataIndex: 'is_published', width: 70, render: (v) => (v ? t('common.yes') : t('common.no')) },
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
      <Modal title={editing ? t('common.edit') : t('common.add')} open={open} onCancel={() => setOpen(false)} onOk={onSave} width={720}>
        <Form form={form} layout="vertical" className="mt-4">
          <p className="mb-3 text-xs text-slate-500">{t('common.contentLang')}</p>
          <Form.Item name="slug" label={t('common.slug')} rules={[{ required: true }]}><Input disabled={!!editing} /></Form.Item>
          <Form.Item name="title_i18n" label={t('common.title')} rules={[{ required: true }]}><I18nInput /></Form.Item>
          <Form.Item name="excerpt_i18n" label="Qısa təsvir" rules={[{ required: true }]}><I18nTextArea rows={2} /></Form.Item>
          <Form.Item name="content_i18n" label="Məzmun"><I18nTextArea rows={6} /></Form.Item>
          <div className="grid gap-4 md:grid-cols-2">
            <Form.Item name="category_i18n" label="Kateqoriya"><I18nInput /></Form.Item>
            <Form.Item name="post_type" label="Tip" rules={[{ required: true }]}>
              <Select options={[
                { value: 'xeberler', label: 'Xəbərlər' },
                { value: 'qanunvericilik', label: 'Qanunvericilik' },
              ]} />
            </Form.Item>
          </div>
          <Form.Item name="cover_image_url" label="Örtük şəkli"><MediaUrlInput folder="blog" /></Form.Item>
          <Form.Item name="published_at" label="Tarix"><DatePicker className="w-full" /></Form.Item>
          <Form.Item name="is_published" label={t('common.active')} valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
