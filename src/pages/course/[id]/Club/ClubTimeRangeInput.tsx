import React from 'react';
import { TimePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const TIME_RANGE_REGEX = /^\s*(\d{1,2})(?::(\d{2}))?\s*[-–—]\s*(\d{1,2})(?::(\d{2}))?\s*$/;

const toLatinDigits = (text: string) =>
  text
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));

const toTime = (hour: string, minute?: string): Dayjs | null => {
  const h = Number(hour);
  const m = Number(minute ?? 0);
  if (h > 23 || m > 59) return null;
  return dayjs().hour(h).minute(m).second(0).millisecond(0);
};

/** Parses "18-22" / "18:00-20:30" into a pair of times, or null if it is free text. */
const parseTimeRange = (value?: string | null): [Dayjs, Dayjs] | null => {
  if (!value) return null;
  const match = toLatinDigits(value).match(TIME_RANGE_REGEX);
  if (!match) return null;
  const start = toTime(match[1], match[2]);
  const end = toTime(match[3], match[4]);
  return start && end ? [start, end] : null;
};

interface ClubTimeRangeInputProps {
  /** Free-text API value, written as "HH:mm-HH:mm" */
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export const ClubTimeRangeInput: React.FC<ClubTimeRangeInputProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const parsed = parseTimeRange(value);

  return (
    <div>
      <TimePicker.RangePicker
        className="w-full"
        format="HH:mm"
        minuteStep={5}
        order={false}
        value={parsed}
        placeholder={['شروع', 'پایان']}
        disabled={disabled}
        onChange={(range) => {
          const [start, end] = range ?? [];
          onChange?.(start && end ? `${start.format('HH:mm')}-${end.format('HH:mm')}` : '');
        }}
      />
      {value && !parsed && (
        <div className="mt-1 text-xs text-gray-400">مقدار فعلی: {value}</div>
      )}
    </div>
  );
};
