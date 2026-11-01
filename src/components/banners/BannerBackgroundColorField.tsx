import React, { useEffect, useState } from 'react';
import { ColorPicker, Input, Button } from 'antd';
import {
  BANNER_BACKGROUND_PRESETS,
  DEFAULT_BANNER_BACKGROUND_COLOR,
} from '@/types/banner.types';
import { normalizeBannerHexColor } from '@/utils/banner.utils';

interface BannerBackgroundColorFieldProps {
  value?: string;
  onChange?: (value: string) => void;
}

export const BannerBackgroundColorField: React.FC<BannerBackgroundColorFieldProps> = ({
  value,
  onChange,
}) => {
  const committed = (value?.trim() || DEFAULT_BANNER_BACKGROUND_COLOR).toUpperCase();
  const [draftHex, setDraftHex] = useState(committed);

  useEffect(() => {
    setDraftHex(committed);
  }, [committed]);

  const applyHex = (next: string) => {
    const normalized = normalizeBannerHexColor(next);
    if (normalized) {
      onChange?.(normalized);
      setDraftHex(normalized);
    } else {
      setDraftHex(committed);
    }
  };

  return (
    <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-2.5">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {BANNER_BACKGROUND_PRESETS.map((color) => {
          const selected = committed === color.toUpperCase();
          return (
            <button
              key={color}
              type="button"
              title={color}
              aria-label={`رنگ ${color}`}
              aria-pressed={selected}
              className={`h-7 w-7 shrink-0 rounded-md border-2 shadow-sm transition hover:scale-105 ${
                selected
                  ? 'border-[#4B26AD] ring-2 ring-[#4B26AD]/25'
                  : 'border-white ring-1 ring-gray-200'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => applyHex(color)}
            />
          );
        })}
        <Button
          type="link"
          size="small"
          className="ms-auto px-1 text-xs text-gray-500"
          onClick={() => applyHex(DEFAULT_BANNER_BACKGROUND_COLOR)}
        >
          پیش‌فرض
        </Button>
      </div>

      <div className="flex items-stretch gap-2">
        <ColorPicker
          value={committed}
          onChange={(color) => applyHex(color.toHexString())}
          format="hex"
          disabledAlpha
          size="large"
          className="banner-color-picker-trigger shrink-0"
        />
        <Input
          value={draftHex}
          onChange={(e) => setDraftHex(e.target.value.toUpperCase())}
          onBlur={() => applyHex(draftHex)}
          onPressEnter={() => applyHex(draftHex)}
          dir="ltr"
          placeholder={DEFAULT_BANNER_BACKGROUND_COLOR}
          className="h-10 flex-1 font-mono text-sm"
          maxLength={7}
          aria-label="کد هگز رنگ"
        />
      </div>
    </div>
  );
};
