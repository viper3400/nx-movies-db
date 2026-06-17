import { Button, PressEvent, Tooltip } from "@heroui-v3/react";
import { Surprise } from "../icons";
import { t } from "i18next";

interface SurpriseButtonProperties {
  onPress?: (e: PressEvent) => void;
  dataTestId?: string;
  isDefaultFilter?: boolean;
}
export const SurpriseButton = ({ onPress, dataTestId, isDefaultFilter = true }: SurpriseButtonProperties) => {
  return (
    <Tooltip delay={0}>
      <Tooltip.Trigger>
        <Button
          data-testid={dataTestId}
          onPress={onPress}
          isIconOnly
          variant="outline"
          size="lg"
        >
          {isDefaultFilter ? (
            <Surprise />
          ) : (
            <span className="relative inline-flex">
              <Surprise />
              <span
                data-testid="surprise-button-filter-indicator"
                aria-hidden="true"
                className="absolute -bottom-0.5 -right-1 h-2.5 w-2.5 rounded-full bg-secondary-500 ring-2 ring-background"
              />
            </span>
          )}
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        {t("search.randomMoviesFilterLabel")}
      </Tooltip.Content>
    </Tooltip>
  );
};
