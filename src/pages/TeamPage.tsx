import { useState } from 'react'
import { Table, Button, Modal, Form, InputNumber, Switch, Space, Image } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useCrud } from '../hooks/useCrud'
import { PageHeader, MediaUrlInput } from '../components/MediaUrlInput'
import { I18nInput } from '../components/I18nFields'
import { prepareI18nSave, rowToFormI18n } from '../lib/i18nForm'
import type { TeamMember } from '../types/database'

export function TeamPage() {
  const { t } = useTranslation()
  const { query, create, update, remove } = useCrud<TeamMember>({
    table: 'team_members',
    queryKey: ['team_members'],
  })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [form] = Form.useForm()

  const openModal = (row?: TeamMember) => {
    setEditing(row ?? null)
    form.setFieldsValue(
      row
        ? rowToFormI18n(row as never, ['name', 'role'])
        : { sort_order: (query.data?.length ?? 0) + 1, is_published: true, image_url: '' },
    )
    setOpen(true)
  }

  const onSave = async () => {
    const values = await form.validateFields()
    const payload = prepareI18nSave(values, ['name', 'role'])
    if (editing) await update.mutateAsync({ id: editing.id, ...payload })
    else await create.mutateAsync(payload)
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title={t('nav.team')}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>{t('common.add')}</Button>}
      />
      <Table
        loading={query.isLoading}
        dataSource={query.data}
        rowKey="id"
        columns={[
          {
            title: 'Şəkil',
            dataIndex: 'image_url',
            width: 72,
            render: (url, row) =>
              url ? <Image src={url} width={48} height={48} className="rounded-full object-cover" /> : (
                <div className="grid h-12 w-12 place-items-center rounded-full bg-navy-900 text-gold-400">{row.name[0]}</div>
              ),
          },
          { title: 'Ad', dataIndex: 'name' },
          { title: 'Vəzifə', dataIndex: 'role' },
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
      <Modal title={editing ? t('common.edit') : t('common.add')} open={open} onCancel={() => setOpen(false)} onOk={onSave} width={520}>
        <Form form={form} layout="vertical" className="mt-4">
          <p className="mb-3 text-xs text-slate-500">{t('common.contentLang')}</p>
          <Form.Item name="name_i18n" label="Ad Soyad" rules={[{ required: true }]}><I18nInput /></Form.Item>
          <Form.Item name="role_i18n" label="Vəzifə" rules={[{ required: true }]}><I18nInput /></Form.Item>
          <Form.Item name="image_url" label="Şəkil"><MediaUrlInput folder="team" /></Form.Item>
          <Form.Item name="sort_order" label={t('common.order')}><InputNumber className="w-full" min={0} /></Form.Item>
          <Form.Item name="is_published" label={t('common.active')} valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
