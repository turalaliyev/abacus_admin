import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table,
  Tag,
  Button,
  Drawer,
  Select,
  Space,
  Badge,
  Descriptions,
  message,
  Typography,
  Empty,
} from 'antd'
import { EyeOutlined, InboxOutlined } from '@ant-design/icons'
import { supabase } from '../lib/supabase'
import { PageHeader } from '../components/MediaUrlInput'

const { Text } = Typography

type Submission = {
  id: string
  full_name: string
  company_name: string
  phone: string
  email: string
  services: string[]
  goal: string
  timeline: string
  budget: string
  notes: string
  status: 'new' | 'contacted' | 'closed'
  created_at: string
}

const STATUS_COLORS: Record<Submission['status'], string> = {
  new: 'blue',
  contacted: 'orange',
  closed: 'green',
}

const STATUS_LABELS: Record<Submission['status'], string> = {
  new: 'Yeni',
  contacted: 'Əlaqə saxlanılıb',
  closed: 'Bağlandı',
}

const SERVICE_LABELS: Record<string, string> = {
  audit: 'Audit',
  vergi: 'Vergi uçotu',
  muhasibat: 'Mühasibat uçotu',
  konsaltinq: 'Konsaltinq',
  qiymetlendirme: 'Qiymətləndirmə',
  huquq: 'Hüquqi xidmətlər',
  qeydiyyat: 'Şirkət qeydiyyatı',
  kadr: 'Kadr kargüzarlığı',
  miqrasiya: 'Miqrasiya xidmətləri',
}

const TIMELINE_LABELS: Record<string, string> = {
  asap: 'Mümkün qədər tez',
  month1: '1 ay ərzində',
  months3: '1–3 ay ərzində',
  flexible: 'Elastik',
}

const BUDGET_LABELS: Record<string, string> = {
  lt1000: '1.000 AZN-dən az',
  '1000to5000': '1.000 – 5.000 AZN',
  '5000to10000': '5.000 – 10.000 AZN',
  gt10000: '10.000 AZN+',
  unsure: 'Hələ bilmirəm',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('az-AZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function InquiriesPage() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState<Submission | null>(null)

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['inquiry_submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inquiry_submissions')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Submission[]
    },
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('inquiry_submissions')
        .update({ status })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      message.success('Status yeniləndi')
      qc.invalidateQueries({ queryKey: ['inquiry_submissions'] })
      setSelected((prev) => prev ? { ...prev, status: selected?.status as Submission['status'] } : null)
    },
    onError: (e: Error) => message.error(e.message),
  })

  const newCount = submissions?.filter((s) => s.status === 'new').length ?? 0

  return (
    <div>
      <PageHeader
        title={
          <Space>
            Müraciətlər
            {newCount > 0 && <Badge count={newCount} color="blue" />}
          </Space>
        }
        subtitle="Saytdan daxil olan müştəri müraciətləri"
      />

      <Table
        loading={isLoading}
        dataSource={submissions}
        rowKey="id"
        locale={{ emptyText: <Empty icon={<InboxOutlined />} description="Hələ müraciət yoxdur" /> }}
        rowClassName={(row) => row.status === 'new' ? 'font-semibold' : ''}
        columns={[
          {
            title: 'Tarix',
            dataIndex: 'created_at',
            width: 140,
            render: (v: string) => (
              <Text className="text-xs text-slate-500">{formatDate(v)}</Text>
            ),
          },
          {
            title: 'Ad / Şirkət',
            key: 'name',
            render: (_, row) => (
              <div>
                <div className="font-medium text-navy-900">{row.full_name}</div>
                {row.company_name && (
                  <div className="text-xs text-slate-500">{row.company_name}</div>
                )}
              </div>
            ),
          },
          {
            title: 'Əlaqə',
            key: 'contact',
            render: (_, row) => (
              <div className="text-xs space-y-0.5">
                <div><a href={`tel:${row.phone}`} className="text-blue-600">{row.phone}</a></div>
                <div><a href={`mailto:${row.email}`} className="text-blue-600">{row.email}</a></div>
              </div>
            ),
          },
          {
            title: 'Xidmətlər',
            dataIndex: 'services',
            render: (services: string[]) => (
              <div className="flex flex-wrap gap-1">
                {services.map((s) => (
                  <Tag key={s} className="text-xs">{SERVICE_LABELS[s] ?? s}</Tag>
                ))}
              </div>
            ),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            width: 160,
            render: (status: Submission['status'], row) => (
              <Select
                size="small"
                value={status}
                className="w-full"
                onChange={(val) => updateStatus.mutate({ id: row.id, status: val })}
                options={Object.entries(STATUS_LABELS).map(([value, label]) => ({
                  value,
                  label: <Tag color={STATUS_COLORS[value as Submission['status']]}>{label}</Tag>,
                }))}
              />
            ),
          },
          {
            title: '',
            width: 50,
            render: (_, row) => (
              <Button
                icon={<EyeOutlined />}
                size="small"
                type="text"
                onClick={() => setSelected(row)}
              />
            ),
          },
        ]}
      />

      <Drawer
        title={
          <Space>
            <span>{selected?.full_name}</span>
            {selected && (
              <Tag color={STATUS_COLORS[selected.status]}>
                {STATUS_LABELS[selected.status]}
              </Tag>
            )}
          </Space>
        }
        open={!!selected}
        onClose={() => setSelected(null)}
        width={520}
      >
        {selected && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Ad / Soyad">{selected.full_name}</Descriptions.Item>
            {selected.company_name && (
              <Descriptions.Item label="Şirkət">{selected.company_name}</Descriptions.Item>
            )}
            <Descriptions.Item label="Telefon">
              <a href={`tel:${selected.phone}`}>{selected.phone}</a>
            </Descriptions.Item>
            <Descriptions.Item label="E-poçt">
              <a href={`mailto:${selected.email}`}>{selected.email}</a>
            </Descriptions.Item>
            <Descriptions.Item label="Xidmətlər">
              <div className="flex flex-wrap gap-1">
                {selected.services.map((s) => (
                  <Tag key={s}>{SERVICE_LABELS[s] ?? s}</Tag>
                ))}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Hədəf / Problem">
              <p className="whitespace-pre-wrap">{selected.goal}</p>
            </Descriptions.Item>
            <Descriptions.Item label="Başlama müddəti">
              {TIMELINE_LABELS[selected.timeline] ?? selected.timeline}
            </Descriptions.Item>
            <Descriptions.Item label="Büdcə">
              {BUDGET_LABELS[selected.budget] ?? selected.budget}
            </Descriptions.Item>
            {selected.notes && (
              <Descriptions.Item label="Əlavə qeydlər">
                <p className="whitespace-pre-wrap">{selected.notes}</p>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Tarix">{formatDate(selected.created_at)}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Select
                value={selected.status}
                onChange={(val) => {
                  updateStatus.mutate({ id: selected.id, status: val })
                  setSelected({ ...selected, status: val as Submission['status'] })
                }}
                options={Object.entries(STATUS_LABELS).map(([value, label]) => ({
                  value,
                  label: <Tag color={STATUS_COLORS[value as Submission['status']]}>{label}</Tag>,
                }))}
                className="w-full"
              />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}
