// Pure formatting utility functions
// No side effects, immutable operations

/**
 * Formats a numeric value for display
 * @param {number} value - value to format
 * @returns {string} formatted string
 */
export const formatValue = (value) => {
  if (!isFinite(value)) return '∞';
  
  const absoluteValue = Math.abs(value);
  
  if (absoluteValue >= 100) return value.toFixed(1);
  if (absoluteValue >= 10) return value.toFixed(2);
  if (absoluteValue >= 0.001) return value.toFixed(3);
  
  return value.toExponential(2);
};

/**
 * Formats a value for display based on display mode
 * @param {number} value - value to format
 * @param {string} displayMode - 'both' | 'fwd' | 'bwd'
 * @param {string} valueType - 'fwd' | 'bwd'
 * @returns {string} formatted string or empty string
 */
export const formatConditionalValue = (value, displayMode, valueType) => {
  if (displayMode === 'both') return formatValue(value);
  if (displayMode === valueType) return formatValue(value);
  return '';
};

/**
 * Formats loss value for chart footer
 * @param {number} lossValue - loss value
 * @returns {string} formatted string
 */
export const formatLossValue = (lossValue) => {
  return lossValue < 0.001 
    ? lossValue.toExponential(3) 
    : lossValue.toFixed(5);
};

/**
 * Formats chart Y-axis label
 * @param {number} value - value to format
 * @returns {string} formatted string
 */
export const formatChartAxisLabel = (value) => {
  return value < 0.001 
    ? value.toExponential(1) 
    : value.toFixed(3);
};
