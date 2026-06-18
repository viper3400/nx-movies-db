import { Button, Calendar, Drawer } from "@heroui-v3/react";
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

  const renderCalendar = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: DateValue;
    onChange: (value: DateValue) => void;
  }) => (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <Calendar
        aria-label={label}
        firstDayOfWeek="mon"
        value={value}
        onChange={onChange}
      >
        <Calendar.Header>
          <Calendar.NavButton slot="previous" />
          <Calendar.YearPickerTrigger>
            <Calendar.YearPickerTriggerHeading />
            <Calendar.YearPickerTriggerIndicator />
          </Calendar.YearPickerTrigger>
          <Calendar.NavButton slot="next" />
        </Calendar.Header>
        <Calendar.Grid>
          <Calendar.GridHeader>
            {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
          </Calendar.GridHeader>
          <Calendar.GridBody>
            {(date) => (
              <Calendar.Cell date={date}>
                {({ formattedDate }) => formattedDate}
              </Calendar.Cell>
            )}
          </Calendar.GridBody>
        </Calendar.Grid>
      </Calendar>
    </div>
  );

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
      <Drawer>
        <Drawer.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
          <Drawer.Content placement="right">
            <Drawer.Dialog>
              {({ close }) => (
                <>
                  <Drawer.Header className="flex flex-col gap-1">
                    <Drawer.Heading>{t("common.dateSelection")}</Drawer.Heading>
                  </Drawer.Header>
                  <Drawer.Body>
                    <I18nProvider locale="de">
                      {renderCalendar({
                        label: t("common.startDate"),
                        value: parseDate(startIso),
                        onChange: (v) => setStartIso(makeIsoDate(v.toString())),
                      })}
                      {renderCalendar({
                        label: t("common.endDate"),
                        value: parseDate(endIso),
                        onChange: (v) => setEndIso(makeIsoDate(v.toString())),
                      })}
                    </I18nProvider>
                  </Drawer.Body>
                  <Drawer.Footer>
                    <Button variant="danger-soft" onPress={close}>
                      {t("common.close")}
                    </Button>
                    <Button
                      variant="primary"
                      onPress={() => {
                        handleApply();
                        close();
                      }}
                    >
                      {t("common.apply")}
                    </Button>
                  </Drawer.Footer>
                </>
              )}
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </>
  );
};
