import { useMemo } from 'react';
import { Card, Typography, Flex, Row, Col, Button, Space, Badge, Divider, Tag, message } from 'antd';
import { CreditCard, QrCode, Info, Copy, ArrowDownRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useExamStore } from '../../store/examStore';

const { Text } = Typography;

const WalletPage = () => {
  const currentUser = useAuthStore((state) => state.currentUser);


  const subjects = useExamStore((state) => state.subjects);
  const unlockedSubjectIds = useExamStore((state) => state.unlockedSubjectIds);

  const usedCoins = useMemo(() => {
    return unlockedSubjectIds.reduce((total, id) => {
      const subject = subjects.find(s => s.id === id);
      return total + (subject?.unlockCoin || 0);
    }, 0);
  }, [unlockedSubjectIds, subjects]);

  const amount = 50000;


  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    message.success(`Đã sao chép ${label}`);
  };

  const transferContent = useMemo(() => {
    if (!currentUser?.email) return 'ICTU-LMS';
    return currentUser.email.split('@')[0];
  }, [currentUser]);

  // VietQR generation URL
  // Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<ACCOUNT_NAME>
  const qrUrl = useMemo(() => {
    const bankId = 'TPB';
    const accountNo = '01967092701';
    const template = 'qr_only';
    const accountName = 'Phan Binh Tuan';

    return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`;
  }, [amount, transferContent]);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <Row gutter={[24, 24]}>
        {/* Left Column: Balance & Info */}
        <Col xs={24} lg={14}>
          <Space orientation="vertical" size={24} style={{ width: '100%' }}>
            {/* Balance Card */}
            <Card
              variant="borderless"
              style={{
                background: 'var(--gradient-primary)',
                borderRadius: 24,
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Decorative background shapes */}
              <div
                style={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                  borderRadius: '50%',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: -30,
                  left: -20,
                  width: 120,
                  height: 120,
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  borderRadius: '50%',
                }}
              />

              <Flex vertical gap={24} style={{ position: 'relative', zIndex: 1 }}>
                <Flex justify="space-between" align="flex-start">
                  <div>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>
                      Số dư hiện tại
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 8 }}>
                      <span style={{ color: 'white', fontSize: 36, fontWeight: 800, lineHeight: 1, textShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        {currentUser?.coin?.toLocaleString() || 0}
                      </span>
                      <span style={{ color: 'white', opacity: 0.9, fontSize: 20, fontWeight: 600 }}>Coin</span>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Tag color="red" style={{
                        borderRadius: 12,
                        border: 'none',
                        background: 'rgba(239, 68, 68, 0.2)',
                        padding: '4px 10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        backdropFilter: 'blur(4px)'
                      }}>
                        <ArrowDownRight size={14} style={{ color: '#fca5a5' }} />
                        <span style={{ color: '#fef2f2', fontWeight: 500 }}>
                          Đã sử dụng: {usedCoins.toLocaleString()} Coin
                        </span>
                      </Tag>
                    </div>
                  </div>
                </Flex>

                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '16px 20px',
                  borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(5px)'
                }}>
                  <Flex align="center" gap={12}>
                    <Info size={18} style={{ color: 'white' }} />
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}>
                      Tỷ quy đổi: <b style={{ color: 'white' }}>1,000 VNĐ = 1 Coin</b>
                    </Text>
                  </Flex>
                </div>
              </Flex>
            </Card>

            {/* Recharge Info Card */}
            <Card
              title={<Flex align="center" gap={8}><CreditCard size={18} /><span>Thông tin nạp tiền</span></Flex>}
              variant="borderless"
              style={{
                borderRadius: 20,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                background: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Space orientation="vertical" size={16} style={{ width: '100%' }}>
                <Flex justify="space-between" align="center">
                  <Text type="secondary">Tên đại lý thụ hưởng</Text>
                  <Flex align="center" gap={8}>
                    <Text strong>Phan Tuấn</Text>
                    <Button type="text" size="small" icon={<Copy size={12} />} onClick={() => copyToClipboard('Phan Tuấn', 'tên thụ hưởng')} />
                  </Flex>
                </Flex>
                <Divider style={{ margin: 0 }} />
                <Flex justify="space-between" align="center">
                  <Text type="secondary">Số tài khoản</Text>
                  <Flex align="center" gap={8}>
                    <Text strong style={{ fontSize: 16, color: 'var(--color-primary)' }}>01967092701</Text>
                    <Button type="text" size="small" icon={<Copy size={12} />} onClick={() => copyToClipboard('01967092701', 'số tài khoản')} />
                  </Flex>
                </Flex>
                <Divider style={{ margin: 0 }} />
                <Flex justify="space-between" align="center">
                  <Text type="secondary">Ngân hàng</Text>
                  <Tag color="purple" style={{ fontWeight: 600 }}>TP Bank</Tag>
                </Flex>
                <Divider style={{ margin: 0 }} />
                <Flex justify="space-between" align="center">
                  <Text type="secondary">Nội dung chuyển khoản</Text>
                  <Flex align="center" gap={8}>
                    <Text strong style={{ color: '#e11d48' }}>{transferContent}</Text>
                    <Button type="text" size="small" icon={<Copy size={12} />} onClick={() => copyToClipboard(transferContent, 'nội dung')} />
                  </Flex>
                </Flex>
              </Space>

              <div style={{ marginTop: 24, padding: 16, background: '#fffbeb', borderRadius: 12, border: '1px solid #fef3c7' }}>
                <Text style={{ fontSize: 13, color: '#92400e' }}>
                  <b>Lưu ý:</b> Vui lòng nhập đúng nội dung chuyển khoản là <b>{transferContent}</b> để hệ thống có thể tự động cộng Coin sau 1-5 phút.
                </Text>
              </div>
            </Card>
          </Space>
        </Col>

        {/* Right Column: QR Generator */}
        <Col xs={24} lg={10}>
          <Card
            title={<Flex align="center" gap={8}><QrCode size={18} /><span>Nạp nhanh qua QR</span></Flex>}
            variant="borderless"
            style={{
              height: '100%',
              borderRadius: 24,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              textAlign: 'center',
            }}
          >
            <Flex vertical gap={24}>
              <div
                style={{
                  padding: 20,
                  background: 'white',
                  borderRadius: 20,
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                  position: 'relative',
                  aspectRatio: '1',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={qrUrl}
                  alt="Payment QR"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <Badge status="processing" text="Tự động cập nhật sau 1-5 phút" style={{ color: 'var(--text-muted)' }} />
            </Flex>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WalletPage;
