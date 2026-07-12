import { useState } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useCrud } from '../hooks/useCrud'
import { PageHeader } from '../components/MediaUrlInput'
import { I18nInput } from '../components/I18nFields'
import { prepareI18nSave, rowToFormI18n } from '../lib/i18nForm'
import type { Stat } from '../types/database'

export function StatsPage() {
  const { t } = useTranslation()
  const { query, create, update, remove } = useCrud<Stat>({ table: 'stats', queryKey: ['stats'] })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Stat | null>(null)
  const [form] = Form.useForm()

  const openModal = (row?: Stat) => {
    setEditing(row ?? null)
    form.setFieldsValue(
      row ? rowToFormI18n(row as never, ['label']) : { sort_order: (query.data?.length ?? 0) + 1, suffix: '', value: 0 },
    )
    setOpen(true)
  }

  const onSave = async () => {
    const values = await form.validateFields()
    const payload = prepareI18nSave(values, ['label'])
    if (editing) await update.mutateAsync({ id: editing.id, ...payload })
    else await create.mutateAsync(payload)
    setOpen(false)
  }

  return (
    <div>
      <PageHeader title={t('nav.stats')} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>{t('common.add')}</Button>} />
      <Table
        loading={query.isLoading}
        dataSource={query.data}
        rowKey="id"
        columns={[
          { title: 'Dəyər', dataIndex: 'value' },
          { title: 'Suffix', dataIndex: 'suffix', width: 80 },
          { title: t('common.label'), dataIndex: 'label' },
          { title: t('common.order'), dataIndex: 'sort_order', width: 70 },
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
      <Modal title={editing ? t('common.edit') : t('common.add')} open={open} onCancel={() => setOpen(false)} onOk={onSave}>
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="value" label="Rəqəm" rules={[{ required: true }]}><InputNumber className="w-full" min={0} /></Form.Item>
          <Form.Item name="suffix" label="Suffix (məs: +)"><Input /></Form.Item>
          <p className="mb-3 text-xs text-slate-500">{t('common.contentLang')}</p>
          <Form.Item name="label_i18n" label={t('common.label')} rules={[{ required: true }]}><I18nInput /></Form.Item>
          <Form.Item name="sort_order" label={t('common.order')}><InputNumber className="w-full" min={0} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
