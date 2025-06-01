import { Chip, Spacer, Spinner } from "@heroui/react";
import { t } from "i18next";

interface ResultsStatusIndicatorProperties {
  isLoading: boolean;
  hasNoResults: boolean;
  hasNoMoreResults: boolean;

}
export const ResultsStatusIndicator = ({ isLoading, hasNoResults, hasNoMoreResults }: ResultsStatusIndicatorProperties) => {
  if (hasNoResults && hasNoMoreResults) throw new Error("hasNoResults & hasNoMoreResults can not be true");
  return (
    <>
      <Spacer y={4} />
      {isLoading && (
        <Spinner color="secondary" />)
      }
      {
        !isLoading && hasNoResults && <Chip color="warning" variant="faded" size="lg">{t("result_status_indicator.no_results")}</Chip>
      }
      {
        !isLoading && hasNoMoreResults && <Chip color="warning" variant="faded" size="lg">{t("result_status_indicator.no_more_results")}</Chip>
      }
      <Spacer y={4} />
    </>
  );
};
