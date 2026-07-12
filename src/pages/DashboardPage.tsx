import { Card, Col, Row, Statistic, Typography } from 'antd'
import {
  TeamOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  PictureOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { PageHeader } from '../components/MediaUrlInput'

async function countTable(table: string) {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}

export function DashboardPage() {
  const team = useQuery({ queryKey: ['count', 'team'], queryFn: () => countTable('team_members') })
  const services = useQuery({ queryKey: ['count', 'services'], queryFn: () => countTable('services') })
  const blog = useQuery({ queryKey: ['count', 'blog'], queryFn: () => countTable('blog_posts') })
  const media = useQuery({ queryKey: ['count', 'media'], queryFn: () => countTable('media_assets') })

  return (
    <div>
      <PageHeader
        title="İdarə paneli"
        subtitle="Abacus Audit veb saytının məzmununu idarə edin"
      />
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Komanda üzvləri" value={team.data ?? '—'} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Xidmətlər" value={services.data ?? '—'} prefix={<AppstoreOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Bloq yazıları" value={blog.data ?? '—'} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Media fayllar" value={media.data ?? '—'} prefix={<PictureOutlined />} />
          </Card>
        </Col>
      </Row>
      <Card className="mt-6">
        <Typography.Title level={5}>Tez başlanğıc</Typography.Title>
        <ul className="mt-2 list-inside list-disc space-y-1 text-slate-600">
          <li>Media fayllar bölməsində loqo və hero videosunu yükləyin</li>
          <li>Komanda üzvlərinə şəkil URL-ləri əlavə edin</li>
          <li>Bloq yazıları və akademiya kurslarını yeniləyin</li>
          <li>Sayt parametrlərindən əlaqə məlumatlarını redaktə edin</li>
        </ul>
      </Card>
    </div>
  )
}
