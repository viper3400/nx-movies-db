import { Spacer, Spinner } from "@heroui/react";
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
        !isLoading && hasNoResults && <p>{t("result_status_indicator.no_results")}</p>
      }
      {
        !isLoading && hasNoMoreResults && <p>{t("result_status_indicator.no_more_results")}</p>
      }
      <Spacer y={4} />
    </>
  );
};
