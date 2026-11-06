import React from 'react';
import { Select } from 'antd';
import { CLUB_ICONS, findClubIconByKey, findClubIconBySvg } from '@/constants/clubIcons';
import { sanitizeSvg } from '@/utils/sanitizeHtml';

const CURRENT_ICON_VALUE = '__current__';

const IconLabel: React.FC<{ svg: string; label: string }> = ({ svg, label }) => (
  <span className="flex items-center gap-2">
    <span
      className="inline-flex h-5 w-5 shrink-0 text-[#4B26AD] [&>svg]:h-full [&>svg]:w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
    <span className="truncate">{label}</span>
  </span>
);

const ICON_OPTIONS = CLUB_ICONS.map((icon) => ({
  value: icon.key,
  searchLabel: icon.label,
  label: <IconLabel svg={sanitizeSvg(icon.svg)} label={icon.label} />,
}));

interface ClubIconPickerProps {
  /** Stored SVG markup (form value) */
  value?: string;
  onChange?: (svg: string) => void;
  disabled?: boolean;
}

/**
 * Lets the admin pick a schedule icon from the predefined list.
 * The form value is the icon's SVG markup, which is what the API stores.
 */
export const ClubIconPicker: React.FC<ClubIconPickerProps> = ({ value, onChange, disabled }) => {
  const matched = findClubIconBySvg(value);
  // A stored SVG that is not in our list (e.g. sent directly to the API) stays as-is until replaced.
  const hasUnknownIcon = !!value && !matched;

  const options = hasUnknownIcon
    ? [
        {
          value: CURRENT_ICON_VALUE,
          searchLabel: 'آیکون فعلی',
          label: <IconLabel svg={sanitizeSvg(value)} label="آیکون فعلی" />,
        },
        ...ICON_OPTIONS,
      ]
    : ICON_OPTIONS;

  return (
    <Select
      className="w-full"
      placeholder="انتخاب آیکون"
      value={matched?.key ?? (hasUnknownIcon ? CURRENT_ICON_VALUE : undefined)}
      onChange={(key: string) => {
        const icon = findClubIconByKey(key);
        if (icon) onChange?.(icon.svg);
      }}
      options={options}
      showSearch
      optionFilterProp="searchLabel"
      disabled={disabled}
      listHeight={320}
    />
  );
};
