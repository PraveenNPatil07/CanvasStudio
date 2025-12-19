class CanvasService {
  constructor(
    baseURL = process.env.REACT_APP_API_URL ||
      (process.env.NODE_ENV === "production" ? "/api" : `http://${window.location.hostname}:3001/api`)
  ) {
    this.baseURL = baseURL;
  }

  async request(endpoint, method = "GET", data = null, responseType = "json") {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, options);

      if (!response.ok) {
        const error = new Error(
          `HTTP ${response.status}: ${response.statusText}`
        );
        error.status = response.status;
        throw error;
      }

      if (responseType === "blob") {
        return await response.blob();
      }

      return await response.json();
    } catch (error) {
      if (error.name === "TypeError" && error.message === "Failed to fetch") {
        throw new Error("Network error: Please check your connection");
      }
      throw error;
    }
  }

  async createCanvas(width, height) {
    return this.request("/canvas", "POST", { width, height });
  }

  async updateCanvas(id, width, height) {
    return this.request(`/canvas/${id}`, "PUT", { width, height });
  }

  async addRectangle(canvasId, x, y, width, height, color) {
    return this.request(`/canvas/${canvasId}/elements`, "POST", {
      type: "rectangle",
      x,
      y,
      width,
      height,
      color,
    });
  }

  async addCircle(canvasId, x, y, radius, color) {
    return this.request(`/canvas/${canvasId}/elements`, "POST", {
      type: "circle",
      x,
      y,
      radius,
      color,
    });
  }

  async addText(canvasId, content, x, y, fontSize, color) {
    return this.request(`/canvas/${canvasId}/elements`, "POST", {
      type: "text",
      content,
      x,
      y,
      fontSize,
      color,
    });
  }

  async addImage(canvasId, url, x, y, width, height) {
    return this.request(`/canvas/${canvasId}/elements`, "POST", {
      type: "image",
      url,
      x,
      y,
      width,
      height,
    });
  }

  async addElements(canvasId, elements) {
    return this.request(`/canvas/${canvasId}/elements`, "POST", elements);
  }

  async updateElement(canvasId, elementId, updates) {
    return this.request(
      `/canvas/${canvasId}/elements/${elementId}`,
      "PUT",
      updates
    );
  }

  async updateElements(canvasId, updates) {
    return this.request(`/canvas/${canvasId}/elements`, "PUT", { updates });
  }

  async syncElements(canvasId, elements) {
    return this.request(`/canvas/${canvasId}/elements/sync`, "POST", {
      elements,
    });
  }

  async deleteElement(canvasId, elementId) {
    return this.request(`/canvas/${canvasId}/elements/${elementId}`, "DELETE");
  }

  async deleteElements(canvasId, ids) {
    return this.request(`/canvas/${canvasId}/elements`, "DELETE", { ids });
  }

  async exportPDF(canvasId) {
    return this.request(`/canvas/${canvasId}/export`, "GET", null, "blob");
  }
}

export default CanvasService;
