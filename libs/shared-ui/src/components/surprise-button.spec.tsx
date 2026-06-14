/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import { SurpriseButton } from "./surprise-button";

jest.mock("@heroui/react", () => ({
  Tooltip: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div>{children}</div>,
  Button: ({
    children,
    onPress,
    ...props
  }: {
    children: React.ReactNode;
    onPress?: () => void;
  }) => (
    <button type="button" onClick={onPress} {...props}>
      {children}
    </button>
  ),
  Badge: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
  }) => <span {...props}>{children}</span>,
}));

jest.mock("../icons", () => ({
  Surprise: () => <span data-testid="surprise-icon" />,
}));

jest.mock("i18next", () => ({
  t: (key: string) => key,
}));

describe("SurpriseButton", () => {
  it("does not render the filter indicator when filters are in their default state", () => {
    render(<SurpriseButton isDefaultFilter />);

    expect(screen.getByTestId("surprise-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("surprise-button-filter-indicator")).not.toBeInTheDocument();
  });

  it("renders the filter indicator when non-default filters are active", () => {
    render(<SurpriseButton isDefaultFilter={false} />);

    expect(screen.getByTestId("surprise-icon")).toBeInTheDocument();
    expect(screen.getByTestId("surprise-button-filter-indicator")).toBeInTheDocument();
  });
});
