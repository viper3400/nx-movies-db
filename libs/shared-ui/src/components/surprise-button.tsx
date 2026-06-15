import { Badge } from "@heroui/react";
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
          variant="ghost"
          size="lg"
        >
          {isDefaultFilter ? (
            <Surprise />
          ) : (
            <Badge
              color="secondary"
              content=""
              placement="bottom-right"
              shape="circle"
              data-testid="surprise-button-filter-indicator"
            >
              <Surprise />
            </Badge>
          )}
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        {t("search.randomMoviesFilterLabel")}
      </Tooltip.Content>
    </Tooltip>
  );
};
