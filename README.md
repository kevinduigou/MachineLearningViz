# 🧠 Backpropagation Visualizer

An interactive, real-time visualization of backpropagation and gradient descent in a neural network. Watch how a 2-input sigmoid neuron learns through forward propagation, backward gradient computation, and weight updates.

## 🚀 [**Live Demo**](https://kevinduigou.github.io/MachineLearningViz/backprop_visualizer.html)

Click the link above to try it out! No installation required.

---

## ✨ Features

### 🎯 Interactive Learning Modes
- **Continuous Training**: Watch the network converge in real-time
- **Step-by-Step Mode**: Advance one epoch at a time to understand each phase:
  1. **Forward Pass** - Compute output from inputs
  2. **Backward Pass** - Calculate gradients via chain rule
  3. **Weight Update** - Apply gradient descent

### 📊 Real-Time Visualization
- **Circuit Diagram**: Visual representation of the computational graph
- **Live Values**: See forward pass values and gradients update in real-time
- **Loss Curve**: Track training progress with an animated loss chart
- **Phase Indicators**: Know exactly which phase of training is executing

### 🎛️ Full Control
- **Adjustable Weights** (w₀, w₁, w₂): Manually tune or randomize
- **Input Values** (x₀, x₁): Change the input data
- **Target Output**: Set the desired network output
- **Learning Rate**: Control convergence speed (η)
- **Display Modes**: Toggle between forward values, gradients, or both

### 📈 Educational Insights
- **Gradient Display**: See ∂L/∂w for each weight
- **Step Log**: Detailed epoch-by-epoch training history
- **Tooltips**: Hover over gates to learn about local gradients
- **MSE Loss**: Mean Squared Error visualization

---

## 🧮 Network Architecture

```
Inputs: x₀, x₁
Weights: w₀, w₁, w₂ (bias)

Computation:
  dot = w₀·x₀ + w₁·x₁ + w₂
  ŷ = σ(dot) = 1/(1 + e⁻ᵈᵒᵗ)
  L = (ŷ - y_target)²

Gradient Descent:
  w ← w - η · ∂L/∂w
```

The visualizer breaks down the sigmoid function into elementary operations (multiply, add, negate, exp, inverse) to demonstrate how gradients flow backward through the chain rule.

---

## 🎓 How to Use

1. **[Open the visualizer](https://kevinduigou.github.io/MachineLearningViz/backprop_visualizer.html)**
2. **Adjust parameters** using the left panel sliders
3. **Choose a mode**:
   - Click **▶ Train** for continuous training
   - Click **⏭ Step** to advance one epoch at a time
4. **Watch the magic happen**:
   - Green values = forward pass
   - Red values = gradients (∂L/∂node)
   - Orange = loss
   - Cyan = target
5. **Experiment**:
   - Try different learning rates
   - Change the target value
   - Randomize weights and observe convergence

---

## 🛠️ Technical Details

- **Pure HTML/CSS/JavaScript** - No dependencies, runs entirely in the browser
- **SVG Graphics** - Crisp, scalable circuit visualization
- **Canvas API** - Smooth, animated loss curve rendering
- **Responsive Design** - Works on desktop and tablet
- **Modern UI** - Dark theme with syntax-highlighted code aesthetics

---

## 📚 Learning Objectives

This visualizer helps you understand:
- ✅ Forward propagation through a computational graph
- ✅ Backpropagation and the chain rule
- ✅ Gradient descent optimization
- ✅ How learning rate affects convergence
- ✅ Local gradients in elementary operations
- ✅ The sigmoid activation function decomposed

---

## 🎨 Design Philosophy

Built with a focus on:
- **Clarity**: Every value is visible and labeled
- **Interactivity**: Real-time feedback on every change
- **Education**: Tooltips and step-by-step mode for deep understanding
- **Aesthetics**: Beautiful, modern interface inspired by developer tools

---

## 📄 License

This project is open source and available for educational purposes.

---

## 🤝 Contributing

Found a bug or have a feature idea? Feel free to open an issue or submit a pull request!

---

**Made with ❤️ for machine learning education**
