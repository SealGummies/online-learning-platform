// Chart Utilities Module
// Provides common chart rendering functions for pie charts, bar charts, line charts, etc.
export class ChartUtils {
  /**
   * Creates a simple pie chart on the given canvas context
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
   * @param {Object} options - Chart options
   * @param {string[]} options.labels - Labels for pie chart segments
   * @param {number[]} options.data - Data values for each segment
   * @param {string[]} options.colors - Colors for each segment
   * @param {string} options.title - Chart title (optional)
   */
  static createSimplePieChart(ctx, { labels, data, colors }) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2 - 30;
    const radius = Math.min(width, height) / 3;

    ctx.clearRect(0, 0, width, height);

    // create indexed data array for sorting
    const indexedData = data.map((value, index) => ({
      value,
      label: labels[index],
      index,
    }));

    // sort by value from high to low
    indexedData.sort((a, b) => b.value - a.value);

    const total = data.reduce((sum, val) => sum + val, 0);
    let currentAngle = -Math.PI / 2;

    const chartColors = colors || ChartUtils.defaultColors;

    // draw pie chart sectors (in sorted order)
    indexedData.forEach((item, sortedIndex) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = chartColors[sortedIndex]; // use sorted index
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      currentAngle += sliceAngle;
    });

    // calculate legend layout
    ctx.font = "12px Arial";

    // first measure the actual width of each legend item
    const legendItems = indexedData.map((item) => {
      const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
      const text = `${item.label} (${percentage}%)`;
      const textWidth = ctx.measureText(text).width;
      return {
        text,
        width: textWidth + 30, // 15px color block + 7px spacing + text width + 8px right margin
        item,
      };
    });

    // dynamically calculate the number of items that can be placed per row
    const maxWidth = width - 40; // left and right margin of 20px
    const legendItemHeight = 25;
    const legendLayout = [];
    let currentRow = [];
    let currentRowWidth = 0;

    legendItems.forEach((legendItem, index) => {
      if (currentRowWidth + legendItem.width > maxWidth && currentRow.length > 0) {
        // current row is full, start new row
        legendLayout.push(currentRow);
        currentRow = [legendItem];
        currentRowWidth = legendItem.width;
      } else {
        // add to current row
        currentRow.push(legendItem);
        currentRowWidth += legendItem.width;
      }
    });

    if (currentRow.length > 0) {
      legendLayout.push(currentRow);
    }

    // calculate legend start Y position
    const totalLegendHeight = legendLayout.length * legendItemHeight;
    const legendStartY = height - totalLegendHeight - 15;

    // draw legend
    legendLayout.forEach((row, rowIndex) => {
      // calculate total width of current row
      const rowWidth = row.reduce((sum, item) => sum + item.width, 0);
      // center align
      let currentX = (width - rowWidth) / 2;
      const currentY = legendStartY + rowIndex * legendItemHeight;

      row.forEach((legendItem, colIndex) => {
        const item = legendItem.item;
        const sortedIndex = indexedData.indexOf(item);

        // draw color block
        ctx.fillStyle = chartColors[sortedIndex];
        ctx.fillRect(currentX, currentY, 15, 15);

        // draw text
        ctx.fillStyle = "#333";
        ctx.font = "12px Arial";
        ctx.textAlign = "left";
        ctx.fillText(legendItem.text, currentX + 22, currentY + 12);

        // move to next position
        currentX += legendItem.width;
      });
    });
  }

  /**
   * Creates a simple bar chart on the given canvas context
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
   * @param {Object} options - Chart options
   * @param {string[]} options.labels - Labels for each bar
   * @param {number[]} options.data - Data values for each bar
   * @param {string} options.title - Chart title (optional)
   */
  static createSimpleBarChart(ctx, { labels, data, title }) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const padding = 80; // Increased padding for 700px width
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) return;

    const maxValue = Math.max(...data);
    const barWidth = Math.max(30, (chartWidth / data.length) * 0.8);
    const barSpacing = Math.max(15, (chartWidth / data.length) * 0.2);

    ctx.fillStyle = "#4CAF50";
    data.forEach((value, index) => {
      const barHeight = (value / maxValue) * chartHeight;
      const x = padding + index * (barWidth + barSpacing);
      const y = height - padding - barHeight;

      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw value on top of bar
      ctx.fillStyle = "#333";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";

      // Format value based on chart title
      let displayValue;
      if (title && title.includes("(%)")) {
        // For percentage charts, show 1 decimal place with % symbol
        displayValue = value.toFixed(1) + "%";
      } else if (title && title.includes("($)")) {
        // For revenue charts, show with $ symbol
        displayValue = "$" + value.toFixed(0);
      } else {
        // Default formatting
        displayValue = value < 100 ? value.toFixed(1) : value.toFixed(0);
      }

      ctx.fillText(displayValue.toString(), x + barWidth / 2, y - 5);

      // Draw label horizontally
      ctx.save();
      ctx.translate(x + barWidth / 2, height - padding + 20);
      ctx.font = "10px Arial";
      ctx.fillStyle = "#333";
      ctx.textAlign = "center";

      // Truncate long labels
      const maxLabelLength = 12;
      const displayLabel =
        labels[index].length > maxLabelLength ? labels[index].substring(0, maxLabelLength) + "..." : labels[index];

      ctx.fillText(displayLabel, 0, 0);
      ctx.restore();

      ctx.fillStyle = "#4CAF50";
    });
  }

  /**
   * Creates a simple line chart on the given canvas context
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
   * @param {Object} options - Chart options
   * @param {string[]} options.labels - Labels for each data point
   * @param {number[]} options.data - Data values for each point
   * @param {string} options.title - Chart title (optional)
   */
  static createSimpleLineChart(ctx, { labels, data, title }) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const padding = 80; // Increased padding for 700px width
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) return;

    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const valueRange = maxValue - minValue || 1;

    // Draw grid lines
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw Y-axis labels
    ctx.fillStyle = "#666";
    ctx.font = "10px Arial";
    ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * chartHeight;
      const value = maxValue - (i / 5) * valueRange;
      ctx.fillText(Math.round(value).toString(), padding - 10, y + 3);
    }

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = "#2196F3";
    ctx.lineWidth = 3;

    data.forEach((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = height - padding - ((value - minValue) / valueRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw points
    ctx.fillStyle = "#2196F3";
    data.forEach((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = height - padding - ((value - minValue) / valueRange) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw X-axis labels horizontally
    ctx.fillStyle = "#333";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    labels.forEach((label, index) => {
      const x = padding + (index / (labels.length - 1)) * chartWidth;

      // Truncate long labels
      const maxLabelLength = 10;
      const displayLabel = label.length > maxLabelLength ? label.substring(0, maxLabelLength) + "..." : label;

      ctx.fillText(displayLabel, x, height - padding + 20);
    });
  }

  /**
   * Draws a "No Data" message on the canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
   * @param {string} message - Message to display
   */
  static drawNoDataMessage(ctx, message) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#999";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(message, width / 2, height / 2);
  }

  /**
   * Default color palette for charts
   */
  static get defaultColors() {
    return [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#43A047",
      "#D32F2F",
      "#8D6E63",
      "#FBC02D",
      "#0288D1",
      "#7B1FA2",
      "#00BCD4",
      "#E91E63",
      "#795548",
      "#607D8B",
      "#4CAF50",
      "#FF5722",
      "#3F51B5",
      "#009688",
    ];
  }

  /**
   * Formats values based on chart type
   * @param {number} value - Value to format
   * @param {string} title - Chart title to determine format type
   * @returns {string} Formatted value
   */
  static formatValue(value, title) {
    if (title && title.includes("(%)")) {
      return value.toFixed(1) + "%";
    } else if (title && title.includes("($)")) {
      return "$" + value.toFixed(0);
    } else {
      return value < 100 ? value.toFixed(1) : value.toFixed(0);
    }
  }

  /**
   * Truncates long labels for display
   * @param {string} label - Label to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated label
   */
  static truncateLabel(label, maxLength = 12) {
    return label.length > maxLength ? label.substring(0, maxLength) + "..." : label;
  }
}
