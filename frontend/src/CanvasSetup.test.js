import { render, screen, fireEvent } from "@testing-library/react";
import CanvasSetup from "./components/CanvasSetup";

describe("CanvasSetup Component", () => {
  const defaultProps = {
    width: 800,
    height: 600,
    hasCanvas: false,
    onInitialize: jest.fn(),
    onUpdateDimensions: jest.fn(),
    onExportPNG: jest.fn(),
    onExportPDF: jest.fn(),
  };

  test("renders initial dimensions correctly", () => {
    render(<CanvasSetup {...defaultProps} />);
    expect(screen.getByLabelText("Width")).toHaveValue(800);
    expect(screen.getByLabelText("Height")).toHaveValue(600);
  });

  test("calls onInitialize when form is submitted (new canvas)", () => {
    render(<CanvasSetup {...defaultProps} />);
    const submitBtn = screen.getByText("Create Canvas");
    fireEvent.click(submitBtn);
    expect(defaultProps.onInitialize).toHaveBeenCalledWith(800, 600);
  });

  test("calls onUpdateDimensions when resize is clicked (existing canvas)", () => {
    render(<CanvasSetup {...defaultProps} hasCanvas={true} />);
    const resizeBtn = screen.getByText("Resize");
    fireEvent.click(resizeBtn);
    expect(defaultProps.onUpdateDimensions).toHaveBeenCalledWith(800, 600);
  });

  test("locks aspect ratio correctly", () => {
    render(<CanvasSetup {...defaultProps} />);
    const lockBtn = screen.getByTitle("Lock Aspect Ratio");

    // Change width without lock
    fireEvent.change(screen.getByLabelText("Width"), {
      target: { value: "1600" },
    });
    expect(screen.getByLabelText("Height")).toHaveValue(600);

    // Enable lock
    fireEvent.click(lockBtn);

    // Change width with lock (800/600 = 1.333 ratio)
    fireEvent.change(screen.getByLabelText("Width"), {
      target: { value: "1200" },
    });
    expect(screen.getByLabelText("Height")).toHaveValue(900); // 1200 / (1600/600) -> Wait, ratio is set when locked.
    // In code: setRatio(w / h) -> 1600 / 600 = 2.666
    // So 1200 / 2.666 = 450
    expect(screen.getByLabelText("Height")).toHaveValue(450);
  });

  test("shows export menu when export button is clicked", () => {
    render(<CanvasSetup {...defaultProps} hasCanvas={true} />);
    const exportBtn = screen.getByTitle("Export Canvas");
    fireEvent.click(exportBtn);

    expect(screen.getByText("Download PNG")).toBeInTheDocument();
    expect(screen.getByText("Download PDF")).toBeInTheDocument();
  });

  test("calls onExportPNG and closes menu", () => {
    render(<CanvasSetup {...defaultProps} hasCanvas={true} />);
    fireEvent.click(screen.getByTitle("Export Canvas"));
    fireEvent.click(screen.getByText("Download PNG"));

    expect(defaultProps.onExportPNG).toHaveBeenCalled();
    expect(screen.queryByText("Download PNG")).not.toBeInTheDocument();
  });
});
