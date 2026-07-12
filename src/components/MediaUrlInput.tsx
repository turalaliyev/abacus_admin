import { useState } from 'react'
import { Upload, Input, Space, Button, Image, Typography } from 'antd'
import { UploadOutlined, LinkOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { supabase, STORAGE_BUCKET } from '../lib/supabase'

type MediaUrlInputProps = {
  value?: string
  onChange?: (url: string) => void
  accept?: string
  folder?: string
  preview?: boolean
}

export function MediaUrlInput({
  value = '',
  onChange,
  accept = 'image/*,video/*',
  folder = 'uploads',
  preview = true,
}: MediaUrlInputProps) {
  const [uploading, setUploading] = useState(false)

  const uploadProps: UploadProps = {
    showUploadList: false,
    accept,
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        setUploading(true)

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          throw new Error('Sessiya bitib. Yenidən daxil olun.')
        }

        const f = file as File
        const ext = f.name.split('.').pop() ?? 'bin'
        const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, f, {
          cacheControl: '3600',
          upsert: false,
        })
        if (error) {
          if (error.message.includes('row-level security')) {
            throw new Error(
              'Storage icazəsi yoxdur. Supabase SQL Editor-də supabase/003_admin_rls.sql faylını işə salın.',
            )
          }
          throw error
        }

        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
        onChange?.(data.publicUrl)
        onSuccess?.(data)
      } catch (e) {
        onError?.(e as Error)
      } finally {
        setUploading(false)
      }
    },
  }

  const isVideo = value.match(/\.(mp4|webm|mov)(\?|$)/i)

  return (
    <Space direction="vertical" className="w-full" size="middle">
      <Space.Compact className="w-full">
        <Input
          prefix={<LinkOutlined />}
          placeholder="URL və ya yükləyin"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />} loading={uploading}>
            Yüklə
          </Button>
        </Upload>
      </Space.Compact>
      {preview && value && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2">
          {isVideo ? (
            <video src={value} controls className="max-h-40 w-full rounded" />
          ) : (
            <Image src={value} alt="Önizləmə" className="max-h-40 object-contain" />
          )}
        </div>
      )}
    </Space>
  )
}

export function PageHeader({
  title,
  subtitle,
  extra,
}: {
  title: string
  subtitle?: string
  extra?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <Typography.Title level={3} className="!mb-1">
          {title}
        </Typography.Title>
        {subtitle && <Typography.Text type="secondary">{subtitle}</Typography.Text>}
      </div>
      {extra}
    </div>
  )
}
