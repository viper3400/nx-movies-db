import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, DatePicker } from "@heroui/react";
import { Button } from "@heroui-v3/react";
import { parseDate, type DateValue } from "@internationalized/date";
import { I18nProvider } from "@react-aria/i18n";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarRangeOutlined } from "../icons";
import { DateRange } from "../interfaces";
import { IsoDate, makeIsoDate } from "@nx-movies-db/shared-types";

interface DateRangeDrawerComponentProps {
  onApply: (dateRange: DateRange) => void;
}
export const DateRangeDrawerComponent = ({ onApply }: DateRangeDrawerComponentProps) => {
  const [startIso, setStartIso] = useState<IsoDate>(makeIsoDate("2010-01-01"));
  const [endIso, setEndIso] = useState<IsoDate>(makeIsoDate("2099-01-01"));

  const [selectedStartDate, setSelectedStartDate] = useState<DateValue | null>(parseDate("2010-01-01"));
  const [selectedEndDate, setSelectedEndDate] = useState<DateValue | null>(parseDate("2099-01-01"));

  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const handleApply = async () => {
    setSelectedStartDate(parseDate(startIso));
    setSelectedEndDate(parseDate(endIso));
    const dateRange: DateRange = { startDate: parseDate(startIso), endDate: parseDate(endIso) };
    onApply(dateRange);
  };

  const formatDate = (date: DateValue | null) => {
    return date
      ? new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(date.toString()))
      : "";
  };

  return (
    <>
      <div className="text-center sm:text-left">
        <Button
          className="mt-4"
          variant="outline"
          onPress={() => setIsOpen(true)}
        >
          <CalendarRangeOutlined />
          {formatDate(selectedStartDate)} - {formatDate(selectedEndDate)}
        </Button>
      </div>
      <Drawer isOpen={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">{t("common.dateSelection")}</DrawerHeader>
              <DrawerBody>
                <I18nProvider locale="de">
                  <DatePicker
                    firstDayOfWeek="mon"
                    showMonthAndYearPickers
                    value={parseDate(startIso)}
                    onChange={(v) => v && setStartIso(makeIsoDate(v.toString()))}
                    label={t("common.startDate")} />
                  <DatePicker
                    firstDayOfWeek="mon"
                    showMonthAndYearPickers
                    label={t("common.endDate")}
                    value={parseDate(endIso)}
                    onChange={(v) => v && setEndIso(makeIsoDate(v.toString()))} />
                </I18nProvider>
              </DrawerBody>
              <DrawerFooter>
                <Button variant="danger-soft" onPress={onClose}>
                  {t("common.close")}
                </Button>
                <Button variant="primary" onPress={() => { handleApply(); onClose(); }}>
                  {t("common.apply")}
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer >
    </>
  );
};
