import { useMemo, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Avatar, Dropdown, theme } from 'antd'
import {
  DashboardOutlined,
  SettingOutlined,
  PictureOutlined,
  MenuOutlined,
  TeamOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  ClusterOutlined,
  StarOutlined,
  FileTextOutlined,
  ReadOutlined,
  LogoutOutlined,
  UserOutlined,
  FormOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

const { Header, Content } = Layout

const SIDER_WIDTH = 260
const SIDER_COLLAPSED_WIDTH = 80

const MENU_KEYS = [
  { key: '/', icon: <DashboardOutlined />, labelKey: 'nav.dashboard' },
  { key: '/settings', icon: <SettingOutlined />, labelKey: 'nav.settings' },
  { key: '/media', icon: <PictureOutlined />, labelKey: 'nav.media' },
  { key: '/navigation', icon: <MenuOutlined />, labelKey: 'nav.navigation' },
  { key: '/team', icon: <TeamOutlined />, labelKey: 'nav.team' },
  { key: '/services', icon: <AppstoreOutlined />, labelKey: 'nav.services' },
  { key: '/stats', icon: <BarChartOutlined />, labelKey: 'nav.stats' },
  { key: '/partners', icon: <ClusterOutlined />, labelKey: 'nav.partners' },
  { key: '/why-us', icon: <StarOutlined />, labelKey: 'nav.whyUs' },
  { key: '/blog', icon: <FileTextOutlined />, labelKey: 'nav.blog' },
  { key: '/academy', icon: <ReadOutlined />, labelKey: 'nav.academy' },
  { key: '/inquiries', icon: <FormOutlined />, labelKey: 'nav.inquiries' },
] as const

export function AdminLayout() {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const { token } = theme.useToken()

  const menuItems = useMemo(
    () => MENU_KEYS.map((item) => ({ key: item.key, icon: item.icon, label: t(item.labelKey) })),
    [t],
  )

  const selectedKey = MENU_KEYS.find((m) =>
    m.key === '/' ? location.pathname === '/' : location.pathname.startsWith(m.key),
  )?.key ?? '/'

  const siderWidth = collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH

  return (
    <Layout className="min-h-screen">
      <Layout.Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={SIDER_WIDTH}
        collapsedWidth={SIDER_COLLAPSED_WIDTH}
        className="admin-sider !bg-navy-950"
        style={{ background: '#071525' }}
      >
        <div className="flex h-16 shrink-0 items-center gap-2 px-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gold-500 font-bold text-navy-950">
            A
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-white">
              Abacus <span className="text-gold-500">{t('common.admin')}</span>
            </span>
          )}
        </div>
        <div className="admin-sider-menu">
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ background: 'transparent', borderInlineEnd: 'none' }}
          />
        </div>
      </Layout.Sider>

      <Layout style={{ marginLeft: siderWidth, minHeight: '100vh', transition: 'margin-left 0.2s' }}>
        <Header
          className="sticky top-0 z-20 flex items-center justify-end gap-4 px-6"
          style={{ background: token.colorBgContainer, padding: '0 24px' }}
        >
          <LanguageSwitcher />
          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: t('common.logout'),
                  onClick: () => signOut(),
                },
              ],
            }}
          >
            <Button type="text" className="flex items-center gap-2">
              <Avatar size="small" icon={<UserOutlined />} className="!bg-navy-900" />
              <span className="hidden sm:inline">{user?.email}</span>
            </Button>
          </Dropdown>
        </Header>
        <Content className="m-4 rounded-xl bg-white p-6 shadow-sm md:m-6">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
