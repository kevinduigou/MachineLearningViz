# Backpropagation Visualizer - React Version

A beautiful, interactive visualization of backpropagation in a 2-input sigmoid neuron with MSE loss. Built with React following functional programming principles.

## Features

- **Interactive Training**: Watch the network learn in real-time with adjustable learning rate
- **Step-by-Step Mode**: Advance through forward pass, backward pass, and weight updates one epoch at a time
- **Live Visualization**: See forward values and gradients update on the circuit diagram
- **Loss Tracking**: Real-time loss curve visualization
- **Fully Adjustable**: Modify weights, inputs, target, and learning rate on the fly

## Architecture

This React version follows **functional programming principles**:

- ✅ **Immutability**: All state updates create new objects
- ✅ **No Side Effects**: Pure computation functions in `utils/computation.js`
- ✅ **Clear Variable Names**: Descriptive, explicit naming throughout
- ✅ **Separation of Concerns**: Logic separated from presentation

### Project Structure

```
src/
├── components/
│   ├── Header.jsx           # Top navigation and controls
│   ├── LeftPanel.jsx        # Sliders and statistics
│   ├── CircuitSVG.jsx       # Neural network visualization
│   ├── RightPanel.jsx       # Loss chart
│   └── Tooltip.jsx          # Interactive tooltips
├── utils/
│   ├── computation.js       # Pure functions for forward/backward passes
│   └── formatting.js        # Pure formatting utilities
├── App.jsx                  # Main application with state management
├── main.jsx                 # React entry point
└── styles.css               # Global styles

```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How It Works

### Pure Computation Layer

All mathematical operations are pure functions with no side effects:

```javascript
// Pure function - no mutations, explicit inputs/outputs
export const computeForwardBackward = (weights, inputs, targetValue) => {
  // Compute forward pass
  const multiplyW0X0 = weights.w0 * inputs.x0;
  const multiplyW1X1 = weights.w1 * inputs.x1;
  // ... more computations
  
  return { forwardValues, backwardGradients };
};
```

### Immutable State Updates

All state updates create new objects:

```javascript
// Immutable weight update
const updatedWeights = applyGradientDescent(weights, gradients, learningRate);
setWeights(updatedWeights);  // New object, not mutation
```

### Component Architecture

- **Header**: Displays current values and training controls
- **LeftPanel**: Interactive sliders for all parameters
- **CircuitSVG**: Visual representation of the neural network
- **RightPanel**: Real-time loss curve chart
- **Tooltip**: Contextual information on hover

## Key Concepts Visualized

1. **Forward Pass**: Input flows through multiply gates → add gate → sigmoid activation
2. **Backward Pass**: Gradients flow backward using chain rule
3. **Weight Update**: Gradient descent: `w ← w - η·∂L/∂w`
4. **Loss Function**: MSE loss `L = (ŷ - y)²`

## Technologies

- **React 18**: Modern hooks-based architecture
- **Vite**: Fast build tool and dev server
- **Canvas API**: For loss curve visualization
- **SVG**: For neural network circuit diagram

## Functional Programming Highlights

### Pure Functions
All computation logic is pure and testable:
- `computeForwardBackward()` - No side effects
- `applyGradientDescent()` - Returns new weights
- `formatValue()` - Pure formatting

### Immutability
State updates never mutate:
```javascript
// ❌ Bad (mutation)
weights.w0 -= learningRate * gradient.w0;

// ✅ Good (immutable)
const updatedWeights = {
  w0: weights.w0 - learningRate * gradient.w0,
  w1: weights.w1 - learningRate * gradient.w1,
  w2: weights.w2 - learningRate * gradient.w2
};
```

### Explicit Naming
Variables have clear, descriptive names:
- `multiplyW0X0` instead of `m0`
- `gradientDotProduct` instead of `gd`
- `forwardValues` instead of `fwd`

## Comparison with Original

| Feature | Original HTML | React Version |
|---------|--------------|---------------|
| Framework | Vanilla JS | React 18 |
| State Management | Global variables | React hooks |
| Mutability | Mutable state | Immutable state |
| Side Effects | Mixed with logic | Separated pure functions |
| Variable Names | Short (w, x, fwd) | Explicit (weights, inputs, forwardValues) |
| Reusability | Monolithic | Component-based |

## License

MIT

## Author

Converted to React with functional programming principles
