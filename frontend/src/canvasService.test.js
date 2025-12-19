import CanvasService from "./services/canvasService";

describe("CanvasService", () => {
  let service;
  let mockFetch;

  beforeEach(() => {
    service = new CanvasService("http://localhost:3001/api");
    mockFetch = jest.fn();
    window.fetch = mockFetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("createCanvas sends correct POST request", async () => {
    const mockResponse = { id: "canvas-123", width: 800, height: 600 };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await service.createCanvas(800, 600);

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/canvas",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ width: 800, height: 600 }),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  test("addRectangle sends correct element data", async () => {
    const mockResponse = { id: "el-1", type: "rectangle" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await service.addRectangle(
      "canvas-123",
      10,
      20,
      100,
      50,
      "#ff0000"
    );

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/canvas/canvas-123/elements",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          type: "rectangle",
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          color: "#ff0000",
        }),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  test("handles HTTP errors gracefully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    await expect(service.createCanvas(800, 600)).rejects.toThrow(
      "HTTP 404: Not Found"
    );
  });

  test("handles network errors", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(service.createCanvas(800, 600)).rejects.toThrow(
      "Network error: Please check your connection"
    );
  });
});
