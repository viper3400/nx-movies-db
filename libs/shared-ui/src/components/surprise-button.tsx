import { Button, PressEvent, Tooltip } from "@heroui/react";
import { Surprise } from "../icons";
import { t } from "i18next";

interface SurpriseButtonProperties {
  onPress?: (e: PressEvent) => void;
  dataTestId?: string;
}
export const SurpriseButton = ({ onPress, dataTestId }: SurpriseButtonProperties) => {
  return (
    <Tooltip content={t("search.randomMoviesFilterLabel")}>
      <Button data-testid={dataTestId} onPress={onPress} isIconOnly variant="ghost" size="lg">
        <Surprise />
      </Button>
    </Tooltip>
  );
};
