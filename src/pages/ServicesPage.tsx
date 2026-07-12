import { useState } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Select, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useCrud } from '../hooks/useCrud'
import { PageHeader, MediaUrlInput } from '../components/MediaUrlInput'
import { I18nInput, I18nRichText } from '../components/I18nFields'
import { prepareI18nSave, rowToFormI18n } from '../lib/i18nForm'
import type { Service } from '../types/database'

const ICONS = ['shield-check', 'receipt', 'calculator', 'lightbulb', 'globe', 'users', 'scale', 'building', 'file']

export function ServicesPage() {
  const { t } = useTranslation()
  const { query, create, update, remove } = useCrud<Service>({
    table: 'services',
    queryKey: ['services'],
  })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form] = Form.useForm()

  const openModal = (row?: Service) => {
    setEditing(row ?? null)
    form.setFieldsValue(
      row
        ? rowToFormI18n(row as never, ['title', 'description'])
        : { sort_order: (query.data?.length ?? 0) + 1, is_published: true, icon: 'file' },
    )
    setOpen(true)
  }

  const onSave = async () => {
    const values = await form.validateFields()
    const payload = prepareI18nSave(values, ['title', 'description'])
    if (editing) await update.mutateAsync({ id: editing.id, ...payload })
    else await create.mutateAsync(payload)
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title={t('nav.services')}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>{t('common.add')}</Button>}
      />
      <Table
        loading={query.isLoading}
        dataSource={query.data}
        rowKey="id"
        columns={[
          { title: t('common.slug'), dataIndex: 'slug', width: 120 },
          { title: t('common.title'), dataIndex: 'title' },
          { title: 'İkon', dataIndex: 'icon', width: 100 },
          { title: t('common.order'), dataIndex: 'sort_order', width: 70 },
          { title: t('common.active'), dataIndex: 'is_published', width: 80, render: (v) => (v ? t('common.yes') : t('common.no')) },
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
      <Modal title={editing ? t('common.edit') : t('common.add')} open={open} onCancel={() => setOpen(false)} onOk={onSave} width={760} styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}>
        <Form form={form} layout="vertical" className="mt-4">
          <p className="mb-3 text-xs text-slate-500">{t('common.contentLang')}</p>
          <Form.Item name="slug" label={t('common.slug')} rules={[{ required: true }]}><Input disabled={!!editing} /></Form.Item>
          <Form.Item name="title_i18n" label={t('common.title')} rules={[{ required: true }]}><I18nInput /></Form.Item>
          <Form.Item
            name="description_i18n"
            label={t('common.description')}
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
          <Form.Item name="icon" label="İkon">
            <Select options={ICONS.map((i) => ({ value: i, label: i }))} />
          </Form.Item>
          <Form.Item name="image_url" label="Şəkil"><MediaUrlInput folder="services" /></Form.Item>
          <Form.Item name="sort_order" label={t('common.order')}><InputNumber className="w-full" min={0} /></Form.Item>
          <Form.Item name="is_published" label={t('common.active')} valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
