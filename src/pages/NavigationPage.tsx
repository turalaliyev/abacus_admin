import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Select, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useCrud } from '../hooks/useCrud'
import { PageHeader } from '../components/MediaUrlInput'
import { I18nInput } from '../components/I18nFields'
import { prepareI18nSave, rowToFormI18n } from '../lib/i18nForm'
import type { NavItem } from '../types/database'

export function NavigationPage() {
  const { t } = useTranslation()
  const { query, create, update, remove } = useCrud<NavItem>({
    table: 'nav_items',
    queryKey: ['nav_items'],
  })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<NavItem | null>(null)
  const [form] = Form.useForm()

  const parents = useQuery({
    queryKey: ['nav_parents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nav_items')
        .select('id, label')
        .is('parent_id', null)
        .order('sort_order')
      if (error) throw error
      return data ?? []
    },
  })

  const openModal = (row?: NavItem) => {
    setEditing(row ?? null)
    form.setFieldsValue(
      row
        ? rowToFormI18n(row as never, ['label'])
        : { sort_order: (query.data?.length ?? 0) + 1, is_visible: true, parent_id: null },
    )
    setOpen(true)
  }

  const onSave = async () => {
    const values = await form.validateFields()
    const payload = { ...prepareI18nSave(values, ['label']), parent_id: values.parent_id || null }
    if (editing) await update.mutateAsync({ id: editing.id, ...payload })
    else await create.mutateAsync(payload)
    setOpen(false)
  }

  const parentLabel = (id: string | null) =>
    parents.data?.find((p) => p.id === id)?.label ?? (id ? '—' : 'Əsas')

  return (
    <div>
      <PageHeader
        title={t('nav.navigation')}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>{t('common.add')}</Button>}
      />
      <Table
        loading={query.isLoading}
        dataSource={query.data}
        rowKey="id"
        columns={[
          { title: t('common.label'), dataIndex: 'label' },
          { title: 'Link', dataIndex: 'href' },
          { title: 'Valideyn', dataIndex: 'parent_id', render: parentLabel },
          { title: t('common.order'), dataIndex: 'sort_order', width: 70 },
          { title: t('common.visible'), dataIndex: 'is_visible', width: 80, render: (v) => (v ? t('common.yes') : t('common.no')) },
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
      <Modal title={editing ? t('common.edit') : t('common.add')} open={open} onCancel={() => setOpen(false)} onOk={onSave} width={520}>
        <Form form={form} layout="vertical" className="mt-4">
          <p className="mb-3 text-xs text-slate-500">{t('common.contentLang')}</p>
          <Form.Item name="label_i18n" label={t('common.label')} rules={[{ required: true }]}><I18nInput /></Form.Item>
          <Form.Item name="href" label="URL" rules={[{ required: true }]}><Input placeholder="/haqqimizda" /></Form.Item>
          <Form.Item name="parent_id" label="Valideyn menyu">
            <Select
              allowClear
              placeholder="Əsas menyu (valideynsiz)"
              options={parents.data?.map((p) => ({ value: p.id, label: p.label }))}
            />
          </Form.Item>
          <Form.Item name="sort_order" label={t('common.order')}><InputNumber className="w-full" min={0} /></Form.Item>
          <Form.Item name="is_visible" label={t('common.visible')} valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
