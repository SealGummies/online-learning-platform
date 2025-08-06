// DOM Utilities - Common DOM manipulation functions
export class DOMUtils {
  /**
   * Show/hide elements by display style
   * @param {string} elementId - Element ID
   * @param {boolean} show - Whether to show or hide
   */
  static toggleElementDisplay(elementId, show) {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.display = show ? "block" : "none";
    }
  }

  /**
   * Remove element from DOM
   * @param {string} elementId - Element ID
   */
  static removeElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.remove();
    }
  }

  /**
   * Get element by ID with error handling
   * @param {string} elementId - Element ID
   * @returns {HTMLElement|null} Element or null if not found
   */
  static getElementById(elementId) {
    return document.getElementById(elementId);
  }

  /**
   * Set element text content safely
   * @param {string} elementId - Element ID
   * @param {string} text - Text content
   */
  static setTextContent(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = text;
    }
  }

  /**
   * Set element HTML content safely
   * @param {string} elementId - Element ID
   * @param {string} html - HTML content
   */
  static setInnerHTML(elementId, html) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = html;
    }
  }

  /**
   * Add event listener to element
   * @param {string} elementId - Element ID
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   */
  static addEventListener(elementId, event, handler) {
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener(event, handler);
    }
  }

  /**
   * Create element with attributes
   * @param {string} tagName - Tag name
   * @param {Object} attributes - Element attributes
   * @param {string} textContent - Text content
   * @returns {HTMLElement} Created element
   */
  static createElement(tagName, attributes = {}, textContent = "") {
    const element = document.createElement(tagName);

    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    if (textContent) {
      element.textContent = textContent;
    }

    return element;
  }

  /**
   * Append element to container
   * @param {string} containerId - Container element ID
   * @param {HTMLElement} element - Element to append
   */
  static appendToContainer(containerId, element) {
    const container = document.getElementById(containerId);
    if (container && element) {
      container.appendChild(element);
    }
  }

  /**
   * Clear container content
   * @param {string} containerId - Container element ID
   */
  static clearContainer(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = "";
    }
  }

  /**
   * Get main dashboard content area
   * @returns {HTMLElement|null} Main content element
   */
  static getMainContent() {
    return document.querySelector("main.dashboard-content");
  }
}
