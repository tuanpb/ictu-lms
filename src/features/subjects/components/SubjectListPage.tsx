import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Input,
  Flex,
  Badge,
  Modal,
  message,
  Tag,
} from 'antd';
import {
  Search,
  Lock,
  Unlock,
  CheckCircle,
} from 'lucide-react';
import { useExamStore } from '../../../store/examStore';
import { useAuthStore } from '../../../store/authStore';
import type { Subject } from '../../../lib/types';

const { Title, Text } = Typography;

const SubjectListPage = () => {
  const navigate = useNavigate();
  const subjects = useExamStore((state) => state.subjects);
  const loading = useExamStore((state) => state.loading);
  const unlockedSubjectIds = useExamStore((state) => state.unlockedSubjectIds);
  const unlockSubject = useExamStore((state) => state.unlockSubject);
  const refreshBalance = useAuthStore((state) => state.refreshBalance);
  const currentUser = useAuthStore((state) => state.currentUser);

  const [searchValue, setSearchValue] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const filteredSubjects = useMemo(() => {
    let result = [...subjects];

    // Tìm kiếm
    if (searchValue) {
      const query = searchValue.toLowerCase();
      result = result.filter(
        (subject) =>
          subject.name.toLowerCase().includes(query) ||
          (subject.description && subject.description.toLowerCase().includes(query))
      );
    }

    // Sắp xếp: Mở khóa lên đầu, sau đó theo tên
    return result.sort((a, b) => {
      const aUnlocked = unlockedSubjectIds.includes(a.id);
      const bUnlocked = unlockedSubjectIds.includes(b.id);

      if (aUnlocked && !bUnlocked) return -1;
      if (!aUnlocked && bUnlocked) return 1;

      return a.name.localeCompare(b.name);
    });
  }, [subjects, searchValue, unlockedSubjectIds]);

  const handleSubjectClick = (subject: Subject) => {
    const isUnlocked = unlockedSubjectIds.includes(subject.id);
    if (isUnlocked) {
      navigate(`/subjects/${subject.id}`);
    } else {
      setSelectedSubject(subject);
      setIsModalVisible(true);
    }
  };

  const handleConfirmUnlock = async () => {
    if (!selectedSubject) return;
    if (!currentUser) {
      message.warning('Vui lòng đăng nhập để mở khóa môn học');
      navigate('/login');
      return;
    }

    setIsUnlocking(true);
    try {
      const result = await unlockSubject(selectedSubject.id, selectedSubject.unlockCoin || 0);
      if (result.success) {
        message.success(`Đã mở khóa thành công môn ${selectedSubject.name}`);
        await refreshBalance();
        setIsModalVisible(false);
      } else {
        message.error(result.error || 'Có lỗi xảy ra khi mở khóa');
      }
    } catch {
      message.error('Lỗi kết nối hệ thống');
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div
        style={{
          position: 'sticky',
          top: 64,
          zIndex: 90,
          padding: '16px 0',
          background: 'rgba(245, 245, 245, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          marginBottom: 16,
          borderRadius: 16,
        }}
      >
        <div style={{ maxWidth: 480, width: '100%', margin: '0 auto' }}>
          <Input
            prefix={<Search size={18} style={{ color: 'var(--text-muted)' }} />}
            placeholder="Tìm kiếm môn học..."
            size="large"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            allowClear
            style={{ borderRadius: 24, height: 48 }}
          />
        </div>
      </div>

      {loading && subjects.length === 0 ? (
        <Flex justify="center" style={{ padding: 64 }}>
          <Text type="secondary">Đang tải danh sách môn học...</Text>
        </Flex>
      ) : (
        <Row gutter={[20, 20]} style={{ padding: '16px 0' }}>
          {filteredSubjects.map((subject, index) => {
            const cardColor = '#6366f1';
            const isUnlocked = unlockedSubjectIds.includes(subject.id);

            return (
              <Col xs={24} sm={12} md={8} lg={6} key={subject.id}>
                <Card
                  hoverable
                  onClick={() => handleSubjectClick(subject)}
                  style={{
                    background: 'var(--bg-card)',
                    backdropFilter: 'blur(16px)',
                    border: isUnlocked ? '1px solid #10b98140' : '1px solid var(--border-subtle)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                    height: '100%',
                  }}
                  styles={{
                    body: { padding: 24 },
                  }}
                >
                  <Flex justify="space-between" align="flex-start">
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 12,
                        background: isUnlocked ? '#10b98115' : `${cardColor}20`,
                        color: isUnlocked ? '#10b981' : cardColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                      }}
                    >
                      {isUnlocked ? <Unlock size={24} /> : <Lock size={24} />}
                    </div>
                    {isUnlocked ? (
                      <Tag color="success" style={{ margin: 0, borderRadius: 12 }}>Đã sở hữu</Tag>
                    ) : (
                      <Badge
                        count={`${subject.unlockCoin} Coin`}
                        style={{
                          backgroundColor: '#f59e0b',
                          borderColor: '#f59e0b',
                        }}
                      />
                    )}
                  </Flex>

                  <Title level={5} style={{ margin: '0 0 4px', color: 'var(--text-primary)' }}>
                    {subject.name}
                  </Title>

                  <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 16, minHeight: 40 }}>
                    {subject.description || 'Chưa có mô tả cho môn học này.'}
                  </Text>

                  <div style={{ display: 'flex', alignItems: 'center', color: isUnlocked ? '#10b981' : 'var(--text-muted)' }}>
                    {isUnlocked ? (
                      <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle size={14} /> Vào học ngay
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Lock size={14} /> Mở khóa ngay
                      </span>
                    )}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {filteredSubjects.length === 0 && (
        <Flex vertical align="center" style={{ padding: 64, color: 'var(--text-muted)' }} gap={16}>
          <Search size={48} strokeWidth={1} />
          <Text type="secondary">Không tìm thấy môn học phù hợp</Text>
        </Flex>
      )}

      <Modal
        title="Xác nhận mở khóa môn học"
        open={isModalVisible}
        onOk={handleConfirmUnlock}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={isUnlocking}
        okText="Mở khóa ngay"
        cancelText="Hủy"
        centered
        style={{ borderRadius: 16 }}
      >
        <Flex vertical gap={12} style={{ padding: '16px 0' }}>
          <Text>Bạn có chắc chắn muốn mở khóa môn học <b>{selectedSubject?.name}</b>?</Text>
          <div style={{
            padding: 16,
            background: '#fef3c7',
            borderRadius: 12,
            border: '1px solid #fcd34d',
            color: '#92400e'
          }}>
            <Text style={{ color: '#92400e' }}>
              Phí mở khóa: <b>{selectedSubject?.unlockCoin} Coin</b>
            </Text>
            <br />
            <Text style={{ fontSize: 12 }}>
              Số dư hiện tại: {currentUser?.coin || 0} Coin
            </Text>
          </div>
        </Flex>
      </Modal>
    </div>
  );
};

export default SubjectListPage;
