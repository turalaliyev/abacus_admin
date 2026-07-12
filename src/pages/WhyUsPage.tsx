import { useState } from 'react'
import { Table, Button, Modal, Form, InputNumber, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useCrud } from '../hooks/useCrud'
import { PageHeader } from '../components/MediaUrlInput'
import { I18nInput, I18nTextArea } from '../components/I18nFields'
import { prepareI18nSave, rowToFormI18n } from '../lib/i18nForm'
import type { WhyUsItem } from '../types/database'

export function WhyUsPage() {
  const { t } = useTranslation()
  const { query, create, update, remove } = useCrud<WhyUsItem>({ table: 'why_us_items', queryKey: ['why_us_items'] })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<WhyUsItem | null>(null)
  const [form] = Form.useForm()

  const openModal = (row?: WhyUsItem) => {
    setEditing(row ?? null)
    form.setFieldsValue(
      row ? rowToFormI18n(row as never, ['title', 'description']) : { sort_order: (query.data?.length ?? 0) + 1 },
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
      <PageHeader title={t('nav.whyUs')} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>{t('common.add')}</Button>} />
      <Table
        loading={query.isLoading}
        dataSource={query.data}
        rowKey="id"
        columns={[
          { title: t('common.title'), dataIndex: 'title' },
          { title: t('common.description'), dataIndex: 'description', ellipsis: true },
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
      <Modal title={editing ? t('common.edit') : t('common.add')} open={open} onCancel={() => setOpen(false)} onOk={onSave} width={560}>
        <Form form={form} layout="vertical" className="mt-4">
          <p className="mb-3 text-xs text-slate-500">{t('common.contentLang')}</p>
          <Form.Item name="title_i18n" label={t('common.title')} rules={[{ required: true }]}><I18nInput /></Form.Item>
          <Form.Item name="description_i18n" label={t('common.description')} rules={[{ required: true }]}><I18nTextArea rows={3} /></Form.Item>
          <Form.Item name="sort_order" label={t('common.order')}><InputNumber className="w-full" min={0} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
