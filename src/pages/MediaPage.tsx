import { useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, Image, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useCrud } from '../hooks/useCrud'
import { PageHeader, MediaUrlInput } from '../components/MediaUrlInput'
import type { MediaAsset } from '../types/database'

export function MediaPage() {
  const { query, create, update, remove } = useCrud<MediaAsset>({
    table: 'media_assets',
    queryKey: ['media_assets'],
    orderBy: { column: 'key' },
  })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<MediaAsset | null>(null)
  const [form] = Form.useForm()

  const openModal = (row?: MediaAsset) => {
    setEditing(row ?? null)
    form.setFieldsValue(row ?? { media_type: 'image', url: '', key: '', alt_text: '' })
    setOpen(true)
  }

  const onSave = async () => {
    const values = await form.validateFields()
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...values })
    } else {
      await create.mutateAsync(values)
    }
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Media fayllar"
        subtitle="Loqo, hero video, poster və digər media URL-ləri"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            Əlavə et
          </Button>
        }
      />
      <Table
        loading={query.isLoading}
        dataSource={query.data}
        rowKey="id"
        columns={[
          { title: 'Açar (key)', dataIndex: 'key', render: (k) => <Tag color="gold">{k}</Tag> },
          {
            title: 'Önizləmə',
            dataIndex: 'url',
            render: (url, row) =>
              url ? (
                row.media_type === 'video' ? (
                  <video src={url} className="h-12 w-20 rounded object-cover" />
                ) : (
                  <Image src={url} width={48} height={48} className="rounded object-cover" />
                )
              ) : (
                <span className="text-slate-400">—</span>
              ),
          },
          { title: 'Tip', dataIndex: 'media_type' },
          { title: 'Alt mətn', dataIndex: 'alt_text', ellipsis: true },
          {
            title: 'Əməliyyat',
            width: 120,
            render: (_, row) => (
              <Space>
                <Button icon={<EditOutlined />} size="small" onClick={() => openModal(row)} />
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                  onClick={() => remove.mutate(row.id)}
                />
              </Space>
            ),
          },
        ]}
      />
      <Modal
        title={editing ? 'Media redaktə' : 'Yeni media'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onSave}
        confirmLoading={create.isPending || update.isPending}
        width={560}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="key" label="Açar (məs: logo, hero_video)" rules={[{ required: true }]}>
            <Input disabled={!!editing} placeholder="logo" />
          </Form.Item>
          <Form.Item name="media_type" label="Tip" rules={[{ required: true }]}>
            <Select options={[
              { value: 'image', label: 'Şəkil' },
              { value: 'video', label: 'Video' },
            ]} />
          </Form.Item>
          <Form.Item name="url" label="URL" rules={[{ required: true }]}>
            <MediaUrlInput
              folder="media"
              accept={form.getFieldValue('media_type') === 'video' ? 'video/*' : 'image/*'}
            />
          </Form.Item>
          <Form.Item name="alt_text" label="Alt mətn"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
