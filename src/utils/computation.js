// Pure functional computation module for forward and backward passes
// No side effects, immutable data structures

/**
 * Computes forward and backward passes for a 2-input sigmoid neuron
 * @param {Object} weights - { w0, w1, w2 }
 * @param {Object} inputs - { x0, x1 }
 * @param {number} targetValue - target output value
 * @returns {Object} { forwardValues, backwardGradients }
 */
export const computeForwardBackward = (weights, inputs, targetValue) => {
  const { w0, w1, w2 } = weights;
  const { x0, x1 } = inputs;

  // Forward pass - compute all intermediate values
  const multiplyW0X0 = w0 * x0;
  const multiplyW1X1 = w1 * x1;
  const dotProduct = multiplyW0X0 + multiplyW1X1 + w2;
  const negatedDot = -dotProduct;
  const exponentialValue = Math.exp(Math.max(-500, Math.min(500, negatedDot)));
  const addOneConstant = exponentialValue + 1;
  const inverseValue = 1 / addOneConstant;
  const outputValue = inverseValue;
  const lossValue = (outputValue - targetValue) ** 2;

  const forwardValues = {
    mul0: multiplyW0X0,
    mul1: multiplyW1X1,
    add: dotProduct,
    neg: negatedDot,
    exp: exponentialValue,
    add1c: addOneConstant,
    inv: inverseValue,
    out: outputValue,
    loss: lossValue
  };

  // Backward pass - compute all gradients
  const gradientOutput = 2 * (outputValue - targetValue);
  const gradientInverse = gradientOutput;
  const gradientAddOneConstant = (-1.0 / (addOneConstant ** 2)) * gradientInverse;
  const gradientExponential = 1 * gradientAddOneConstant;
  const gradientNegated = exponentialValue * gradientExponential;
  const gradientDotProduct = -1 * gradientNegated;
  const gradientMultiply0 = gradientDotProduct;
  const gradientMultiply1 = gradientDotProduct;
  const gradientW2 = gradientDotProduct;
  const gradientW0 = x0 * gradientMultiply0;
  const gradientX0 = w0 * gradientMultiply0;
  const gradientW1 = x1 * gradientMultiply1;
  const gradientX1 = w1 * gradientMultiply1;

  const backwardGradients = {
    out: gradientOutput,
    inv: gradientInverse,
    add1c: gradientAddOneConstant,
    exp: gradientExponential,
    neg: gradientNegated,
    add: gradientDotProduct,
    mul0: gradientMultiply0,
    mul1: gradientMultiply1,
    w2: gradientW2,
    w0: gradientW0,
    x0: gradientX0,
    w1: gradientW1,
    x1: gradientX1
  };

  return { forwardValues, backwardGradients };
};

/**
 * Applies gradient descent to update weights
 * @param {Object} currentWeights - { w0, w1, w2 }
 * @param {Object} gradients - { w0, w1, w2 }
 * @param {number} learningRate - learning rate η
 * @returns {Object} new weights { w0, w1, w2 }
 */
export const applyGradientDescent = (currentWeights, gradients, learningRate) => {
  return {
    w0: currentWeights.w0 - learningRate * gradients.w0,
    w1: currentWeights.w1 - learningRate * gradients.w1,
    w2: currentWeights.w2 - learningRate * gradients.w2
  };
};

/**
 * Generates random weights in range [-3, 3]
 * @returns {Object} { w0, w1, w2 }
 */
export const generateRandomWeights = () => {
  return {
    w0: Math.random() * 6 - 3,
    w1: Math.random() * 6 - 3,
    w2: Math.random() * 6 - 3
  };
};

/**
 * Appends loss to history, maintaining max length
 * @param {Array<number>} currentHistory - current loss history
 * @param {number} newLoss - new loss value to append
 * @param {number} maxLength - maximum history length
 * @returns {Array<number>} new history array
 */
export const appendToLossHistory = (currentHistory, newLoss, maxLength = 500) => {
  const updatedHistory = [...currentHistory, newLoss];
  return updatedHistory.length > maxLength 
    ? updatedHistory.slice(updatedHistory.length - maxLength)
    : updatedHistory;
};

/**
 * Computes average gradients and losses over a dataset
 * @param {Object} weights - { w0, w1, w2 }
 * @param {Array<{x0:number,x1:number,y:number}>} dataset
 * @returns {{ averageGradients: Object, averageLoss: number, sampleLosses: number[] }}
 */
export const computeBatchMetrics = (weights, dataset) => {
  if (!dataset.length) {
    return {
      averageGradients: { w0: 0, w1: 0, w2: 0 },
      averageLoss: 0,
      sampleLosses: []
    };
  }

  const totals = dataset.reduce((acc, sample) => {
    const { forwardValues, backwardGradients } = computeForwardBackward(
      weights,
      { x0: sample.x0, x1: sample.x1 },
      sample.y
    );

    return {
      w0: acc.w0 + backwardGradients.w0,
      w1: acc.w1 + backwardGradients.w1,
      w2: acc.w2 + backwardGradients.w2,
      loss: acc.loss + forwardValues.loss,
      sampleLosses: [...acc.sampleLosses, forwardValues.loss]
    };
  }, { w0: 0, w1: 0, w2: 0, loss: 0, sampleLosses: [] });

  const size = dataset.length;

  return {
    averageGradients: {
      w0: totals.w0 / size,
      w1: totals.w1 / size,
      w2: totals.w2 / size
    },
    averageLoss: totals.loss / size,
    sampleLosses: totals.sampleLosses
  };
};
