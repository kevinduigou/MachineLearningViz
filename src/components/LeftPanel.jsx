import { formatValue } from '../utils/formatting';

const Slider = ({ label, value, onChange, min, max, step, className = '', labelColor = '', displayFormatter = null }) => {
  const displayValue = displayFormatter
    ? displayFormatter(value)
    : (step >= 1 ? value.toFixed(1) : value.toFixed(3));

  return (
    <div className="slider-row">
      <div className="slider-header">
        <span className="slider-name" style={labelColor ? { color: labelColor } : {}}>
          {label}
        </span>
        <span className="slider-value" style={labelColor ? { color: labelColor } : {}}>
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        className={className}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
};

const LeftPanel = ({
  weights,
  inputs,
  targetValue,
  trainingMode,
  currentSampleIndex,
  datasetSize,
  averageLoss,
  sampleLosses,
  learningRate,
  convergenceThreshold,
  displayMode,
  forwardValues,
  backwardGradients,
  stepLogs,
  onWeightChange,
  onTrainingModeChange,
  onLearningRateChange,
  onConvergenceThresholdChange,
  onDisplayModeChange
}) => {
  return (
    <aside className="panel">
      <div className="panel-section">
        <div className="section-label">Weights (trainable)</div>
        <Slider label="w₀" value={weights.w0} onChange={(val) => onWeightChange('w0', val)} min={-5} max={5} step={0.001} labelColor="var(--highlight)" />
        <Slider label="w₁" value={weights.w1} onChange={(val) => onWeightChange('w1', val)} min={-5} max={5} step={0.001} labelColor="var(--highlight)" />
        <Slider label="w₂ (bias)" value={weights.w2} onChange={(val) => onWeightChange('w2', val)} min={-5} max={5} step={0.001} labelColor="var(--highlight)" />
      </div>

      <div className="panel-section">
        <div className="section-label">Mini-dataset training</div>
        <div className="mode-toggle" style={{ marginBottom: '8px' }}>
          <button
            className={`mode-btn ${trainingMode === 'sgd' ? 'active' : ''}`}
            onClick={() => onTrainingModeChange('sgd')}
          >
            SGD (1)
          </button>
          <button
            className={`mode-btn ${trainingMode === 'full-batch' ? 'active' : ''}`}
            onClick={() => onTrainingModeChange('full-batch')}
          >
            Full ({datasetSize})
          </button>
        </div>
        <div style={{ fontSize: '9px', color: 'var(--muted)', lineHeight: 1.6 }}>
          Current sample: #{currentSampleIndex + 1} / {datasetSize}<br />
          x₀={formatValue(inputs.x0)}, x₁={formatValue(inputs.x1)}, y={formatValue(targetValue)}
        </div>
      </div>

      <div className="panel-section">
        <div className="section-label">Loss over data</div>
        <div className="stats">
          <div className="stat-row">
            <span className="stat-key">average L</span>
            <span className="sv-loss">{formatValue(averageLoss)}</span>
          </div>
          {sampleLosses.map((loss, idx) => (
            <div className="stat-row" key={`sample-loss-${idx}`}>
              <span className="stat-key">sample {idx + 1}</span>
              <span className="sv-fwd">{formatValue(loss)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <div className="section-label">Learning rate η</div>
        <Slider label="η" value={learningRate} onChange={onLearningRateChange} min={0.01} max={10} step={0.01} className="lr-sl" labelColor="var(--loss)" />
      </div>

      <div className="panel-section">
        <div className="section-label">Convergence Threshold</div>
        <Slider
          label="ε (epsilon)"
          value={convergenceThreshold}
          onChange={onConvergenceThresholdChange}
          min={1e-10}
          max={1e-2}
          step={1e-10}
          labelColor="var(--fwd)"
          displayFormatter={(val) => val.toExponential(1)}
        />
      </div>

      <div className="panel-section">
        <div className="section-label">Display</div>
        <div className="mode-toggle">
          <button className={`mode-btn ${displayMode === 'both' ? 'active' : ''}`} onClick={() => onDisplayModeChange('both')}>Both</button>
          <button className={`mode-btn ${displayMode === 'fwd' ? 'active' : ''}`} onClick={() => onDisplayModeChange('fwd')}>Fwd</button>
          <button className={`mode-btn ${displayMode === 'bwd' ? 'active' : ''}`} onClick={() => onDisplayModeChange('bwd')}>Grad</button>
        </div>
      </div>

      <div className="panel-section">
        <div className="section-label">Gradients &amp; Values</div>
        <div className="stats">
          <div className="stat-row"><span className="stat-key">∂L/∂w₀</span><span className="sv-bwd">{formatValue(backwardGradients.w0)}</span></div>
          <div className="stat-row"><span className="stat-key">∂L/∂w₁</span><span className="sv-bwd">{formatValue(backwardGradients.w1)}</span></div>
          <div className="stat-row"><span className="stat-key">∂L/∂w₂</span><span className="sv-bwd">{formatValue(backwardGradients.w2)}</span></div>
          <div className="stat-row" style={{ marginTop: '5px', paddingTop: '5px', borderTop: '1px solid var(--border)' }}><span className="stat-key">ŷ (output)</span><span className="sv-fwd">{formatValue(forwardValues.out)}</span></div>
          <div className="stat-row"><span className="stat-key">y (target)</span><span className="sv-tgt">{formatValue(targetValue)}</span></div>
          <div className="stat-row"><span className="stat-key">loss L</span><span className="sv-loss">{formatValue(forwardValues.loss)}</span></div>
        </div>
      </div>

      <div className="panel-section">
        <div className="section-label">Step Log</div>
        <div className="step-log">
          {stepLogs.length === 0 ? (
            <span style={{ color: 'var(--muted)' }}>Use ⏭ Step to advance one epoch at a time.</span>
          ) : (
            stepLogs.map((log, index) => (
              <div key={index} dangerouslySetInnerHTML={{ __html: log }} />
            ))
          )}
        </div>
      </div>
    </aside>
  );
};

export default LeftPanel;
