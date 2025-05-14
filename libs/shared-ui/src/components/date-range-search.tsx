import { Button, DatePicker, DateValue } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { I18nProvider } from "@react-aria/i18n";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface DateRangeSearchComponentProps {
  onApply: (dates: { startDate: DateValue, endDate: DateValue }) => void;
}
export const DateRangeSearchComponent = ({ onApply }: DateRangeSearchComponentProps) => {
  const [startDate, setStartDate] = useState<DateValue | null>(parseDate("2010-01-01"));
  const [endDate, setEndDate] = useState<DateValue | null>(parseDate("2099-01-01"));

  const { t } = useTranslation();


  return (
    <div className="flex flex-col md:flex-row gap-4">
      <I18nProvider locale="de">
        <DatePicker
          firstDayOfWeek="mon"
          showMonthAndYearPickers
          value={startDate}
          onChange={setStartDate}
          label={t("common.startDate")} />
        <DatePicker
          firstDayOfWeek="mon"
          showMonthAndYearPickers
          label={t("common.endDate")}
          value={endDate}
          onChange={setEndDate} />
      </I18nProvider>
      <Button
        className="place-self-center w-full md:max-w-40"
        onPress={() => {
          if (startDate && endDate) {
            onApply({ startDate, endDate });
          }
        }}>
        {t("common.apply")}
      </Button>
    </div>
  );
};
