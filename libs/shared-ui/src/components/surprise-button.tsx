import { Button, PressEvent, Tooltip } from "@heroui/react";
import { Surprise } from "../icons";
import { t } from "i18next";

interface SurpriseButtonProperties {
  onPress?: (e: PressEvent) => void;
}
export const SurpriseButton = ({ onPress }: SurpriseButtonProperties) => {
  return (
    <Tooltip content={t("search.randomMoviesFilterLabel")}>
      <Button onPress={onPress} isIconOnly variant="ghost" size="lg">
        <Surprise />
      </Button>
    </Tooltip>
  );
};
