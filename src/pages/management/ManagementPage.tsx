import React, { useState } from 'react';
import { Card, Input, Button, Popconfirm, Space, Typography } from 'antd';
import { Home, RotateCw, ShieldCheck } from 'lucide-react';
import { PageHeader, VideoIntegrityResultModal } from '@/components/common';
import { useManagement } from '@/hooks';
import type { CheckVideoIntegrityResponse } from '@/types/session.types';

const { Text } = Typography;

export const ManagementPage: React.FC = () => {
  const [renewSessionId, setRenewSessionId] = useState('');
  const [checkSessionId, setCheckSessionId] = useState('');
  const [integrityResult, setIntegrityResult] = useState<CheckVideoIntegrityResponse | null>(null);

  const {
    renewSessionVideo,
    isRenewingSessionVideo,
    checkSessionVideoIntegrity,
    isCheckingSessionVideoIntegrity,
  } = useManagement();

  const handleRenewSessionVideo = async () => {
    if (!renewSessionId.trim()) return;
    await renewSessionVideo(renewSessionId.trim());
    setRenewSessionId('');
  };

  const handleCheckSessionVideoIntegrity = async () => {
    if (!checkSessionId.trim()) return;

    try {
      const result = await checkSessionVideoIntegrity(checkSessionId.trim());

      setIntegrityResult(result);
    } catch {
      // errors are already surfaced via the mutation's onError toast
    }
  };

  return (
    <div>
      <PageHeader
        title="مدیریت ویدیو"
        description="ابزارهای مخصوص سوپرادمین برای بازسازی و بررسی سلامت ویدیوی جلسات"
        breadcrumbItems={[
          {
            title: (
              <span className="flex items-center gap-2">
                <Home size={16} />
                خانه
              </span>
            ),
          },
          {
            title: 'مدیریت ویدیو',
          },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          title={
            <div className="flex items-center gap-2">
              <RotateCw size={18} className="text-primary" />
              <span>بازسازی ویدیو با شناسه جلسه</span>
            </div>
          }
        >
          <Space.Compact className="w-full">
            <Input
              placeholder="شناسه جلسه (Session ID)"
              value={renewSessionId}
              onChange={(e) => setRenewSessionId(e.target.value)}
            />
            <Popconfirm
              title="بازسازی ویدیو"
              description="ویدیوی این جلسه در پس‌زمینه بازسازی و با فرمت جدید تبدیل می‌شود. آیا ادامه می‌دهید؟"
              onConfirm={handleRenewSessionVideo}
              okText="بله، بازسازی شود"
              cancelText="انصراف"
            >
              <Button type="primary" loading={isRenewingSessionVideo} disabled={!renewSessionId.trim()}>
                بازسازی
              </Button>
            </Popconfirm>
          </Space.Compact>
          <Text type="secondary" className="block mt-2 text-xs">
            این عملیات به صورت پس‌زمینه (Background Job) اجرا می‌شود و نتیجه در لاگ سرور قابل مشاهده است.
          </Text>
        </Card>

        <Card
          title={
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-primary" />
              <span>بررسی سلامت ویدیو با شناسه جلسه</span>
            </div>
          }
        >
          <Space.Compact className="w-full">
            <Input
              placeholder="شناسه جلسه (Session ID)"
              value={checkSessionId}
              onChange={(e) => setCheckSessionId(e.target.value)}
              onPressEnter={handleCheckSessionVideoIntegrity}
            />
            <Button
              type="primary"
              loading={isCheckingSessionVideoIntegrity}
              disabled={!checkSessionId.trim()}
              onClick={handleCheckSessionVideoIntegrity}
            >
              بررسی
            </Button>
          </Space.Compact>
        </Card>
      </div>

      <VideoIntegrityResultModal
        open={integrityResult !== null}
        result={integrityResult}
        onClose={() => setIntegrityResult(null)}
      />
    </div>
  );
};
