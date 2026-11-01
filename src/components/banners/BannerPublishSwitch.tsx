import React from 'react';
import { Switch } from 'antd';

/** Form control: `value` is `isDraft`; switch ON means published (`isDraft === false`). */
interface BannerPublishSwitchProps {
  value?: boolean;
  onChange?: (isDraft: boolean) => void;
}

export const BannerPublishSwitch: React.FC<BannerPublishSwitchProps> = ({
  value = true,
  onChange,
}) => (
  <Switch
    checked={value === false}
    onChange={(published) => onChange?.(!published)}
    checkedChildren="منتشر"
    unCheckedChildren="پیش‌نویس"
  />
);
