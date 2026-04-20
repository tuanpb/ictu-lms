import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Avatar, Dropdown, Space, Typography, FloatButton, Button, Grid, Tag } from 'antd';
import type { MenuProps } from 'antd';
import { useAuthStore } from '../../store/authStore';
import { BookOpen, Home, LogOut, User, Wallet, Coins } from 'lucide-react';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    void logout().finally(() => {
      navigate('/login');
    });
  };

  const userMenuItems: MenuProps['items'] = [
    // Trang chủ chỉ hiện ở dropdown khi là mobile
    ...(!screens.md
      ? [
          {
            key: 'home',
            icon: <Home size={14} />,
            label: 'Trang chủ',
            onClick: () => navigate('/'),
          },
        ]
      : []),
    // Ví điểm hiện ở cả mobile và desktop dropdown
    {
      key: 'wallet',
      icon: <Wallet size={14} />,
      label: 'Ví điểm',
      onClick: () => navigate('/wallet'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogOut size={14} />,
      label: 'Đăng xuất',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          height: 64,
          lineHeight: '64px',
        }}
      >
        <div
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <BookOpen size={20} />
          </div>
          <Text
            strong
            style={{
              fontSize: 18,
              color: 'var(--color-primary)',
              letterSpacing: -0.5,
            }}
          >
            DHTN-LMS
          </Text>
        </div>

        {screens.md && (
          <Space size={12} style={{ flex: 1, justifyContent: 'center' }}>
            <Button
              type={location.pathname === '/' ? 'primary' : 'text'}
              icon={<Home size={16} />}
              onClick={() => navigate('/')}
              style={{
                height: 40,
                borderRadius: 999,
                paddingInline: 18,
                fontWeight: 600,
              }}
            >
              Trang chủ
            </Button>
            <Button
              type={location.pathname === '/wallet' ? 'primary' : 'text'}
              icon={<Wallet size={16} />}
              onClick={() => navigate('/wallet')}
              style={{
                height: 40,
                borderRadius: 999,
                paddingInline: 18,
                fontWeight: 600,
              }}
            >
              Ví điểm
            </Button>
          </Space>
        )}

        <Space size={screens.md ? 16 : 8} style={{ flexShrink: 0 }}>
          {currentUser && (
            <Tag
              onClick={() => navigate('/wallet')}
              style={{
                cursor: 'pointer',
                margin: 0,
                padding: '4px 12px',
                borderRadius: 999,
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)')}
            >
              <Coins size={14} style={{ color: '#10b981' }} />
              <Text strong style={{ color: '#10b981', fontSize: 13 }}>
                {currentUser.coin?.toLocaleString() || 0}
                {screens.md && <span style={{ marginLeft: 3, fontWeight: 500 }}>xu</span>}
              </Text>
            </Tag>
          )}

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar
                size={32}
                icon={<User size={16} />}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                }}
              />
              {screens.md && (
                <Text
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: 14,
                    maxWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {currentUser?.fullName ?? currentUser?.email ?? 'Người dùng'}
                </Text>
              )}
            </Space>
          </Dropdown>
        </Space>
      </Header>

      <Content
        style={{
          maxWidth: 1280,
          width: '100%',
          margin: '0 auto',
          padding: '32px 24px',
          flex: 1,
        }}
      >
        <Outlet />
      </Content>

      <Footer
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 100,
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--border-subtle)',
          color: 'var(--text-muted)',
          fontSize: 12,
          padding: '16px 24px',
          marginTop: 'auto',
        }}
      >
        © 2026 DHTN-LMS • Hệ thống Tra cứu Đáp án Trắc nghiệm
      </Footer>

      <FloatButton.BackTop duration={400} style={{ right: 24, bottom: 80 }} />
    </Layout>
  );
};

export default AppLayout;
