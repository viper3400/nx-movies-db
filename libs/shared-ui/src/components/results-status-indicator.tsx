import { Chip, Spinner } from "@heroui/react";
import { t } from "i18next";

interface ResultsStatusIndicatorProperties {
  isLoading: boolean;
  hasNoResults: boolean;
  hasNoMoreResults: boolean;

}
export const ResultsStatusIndicator = ({ isLoading, hasNoResults, hasNoMoreResults }: ResultsStatusIndicatorProperties) => {
  if (hasNoResults && hasNoMoreResults) throw new Error("hasNoResults & hasNoMoreResults can not be true");
  return (
    <div className="py-4">
      {isLoading && (
        <div className="flex justify-left">
          <Spinner color="accent" size="lg" />
        </div>)
      }
      {
        !isLoading && hasNoResults && <Chip color="warning" variant="secondary" size="lg">{t("result_status_indicator.no_results")}</Chip>
      }
      {
        !isLoading && hasNoMoreResults && <Chip color="warning" variant="secondary" size="lg">{t("result_status_indicator.no_more_results")}</Chip>
      }
    </div>
  );
};
