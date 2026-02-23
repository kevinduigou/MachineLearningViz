import { formatConditionalValue, formatValue } from '../utils/formatting';

const CircuitSVG = ({
  weights,
  inputs,
  targetValue,
  forwardValues,
  backwardGradients,
  displayMode,
  currentPhase,
  flashingElements,
  onGateHover,
  onGateLeave
}) => {
  const renderFwdText = (id, value) => {
    const text = formatConditionalValue(value, displayMode, 'fwd');
    const className = flashingElements[id] || '';
    return <text className={`val-fwd ${className}`} id={id} x={getX(id)} y={getY(id)}>{text}</text>;
  };

  const renderBwdText = (id, value) => {
    const text = formatConditionalValue(value, displayMode, 'bwd');
    const className = flashingElements[id] || '';
    return <text className={`val-bwd ${className}`} id={id} x={getX(id)} y={getY(id)}>{text}</text>;
  };

  const getX = (id) => {
    const positions = {
      'nd-w0-f': 61, 'grd-w0': 61, 'nd-x0-f': 61, 'grd-x0': 61,
      'nd-w1-f': 61, 'grd-w1': 61, 'nd-x1-f': 61, 'grd-x1': 61,
      'nd-w2-f': 61, 'grd-w2': 61,
      'gt-mul0-f': 232, 'gt-mul0-b': 232, 'gt-mul1-f': 232, 'gt-mul1-b': 232,
      'gt-add-f': 354, 'gt-add-b': 354, 'gt-neg-f': 453, 'gt-neg-b': 453,
      'gt-exp-f': 553, 'gt-exp-b': 553, 'gt-add1c-f': 653, 'gt-add1c-b': 653,
      'gt-inv-f': 753, 'gt-inv-b': 753, 'nd-out': 861, 'nd-tgt': 985,
      'gt-loss-b': 985, 'lbl-dLdout': 915, 'nd-loss': 1082
    };
    return positions[id] || 0;
  };

  const getY = (id) => {
    const positions = {
      'nd-w0-f': 66, 'grd-w0': 78, 'nd-x0-f': 126, 'grd-x0': 138,
      'nd-w1-f': 207, 'grd-w1': 219, 'nd-x1-f': 267, 'grd-x1': 279,
      'nd-w2-f': 320, 'grd-w2': 332,
      'gt-mul0-f': 97, 'gt-mul0-b': 136, 'gt-mul1-f': 203, 'gt-mul1-b': 242,
      'gt-add-f': 163, 'gt-add-b': 202, 'gt-neg-f': 163, 'gt-neg-b': 202,
      'gt-exp-f': 163, 'gt-exp-b': 202, 'gt-add1c-f': 163, 'gt-add1c-b': 202,
      'gt-inv-f': 163, 'gt-inv-b': 202, 'nd-out': 185, 'nd-tgt': 130,
      'gt-loss-b': 210, 'lbl-dLdout': 159, 'nd-loss': 187
    };
    return positions[id] || 0;
  };

  const wireDefs = [
    { id: 'w0-mul0', x1: 82, y1: 57, x2: 212, y2: 97, fwd: weights.w0, bwd: backwardGradients.w0 },
    { id: 'x0-mul0', x1: 82, y1: 117, x2: 212, y2: 107, fwd: inputs.x0, bwd: backwardGradients.x0 },
    { id: 'w1-mul1', x1: 82, y1: 198, x2: 212, y2: 210, fwd: weights.w1, bwd: backwardGradients.w1 },
    { id: 'x1-mul1', x1: 82, y1: 258, x2: 212, y2: 220, fwd: inputs.x1, bwd: backwardGradients.x1 },
    { id: 'w2-add', x1: 82, y1: 310, x2: 333, y2: 184, fwd: weights.w2, bwd: backwardGradients.w2 },
    { id: 'mul0-add', x1: 252, y1: 106, x2: 333, y2: 173, fwd: forwardValues.mul0, bwd: backwardGradients.mul0 },
    { id: 'mul1-add', x1: 252, y1: 216, x2: 333, y2: 180, fwd: forwardValues.mul1, bwd: backwardGradients.mul1 },
    { id: 'add-neg', x1: 375, y1: 176, x2: 432, y2: 176, fwd: forwardValues.add, bwd: backwardGradients.add },
    { id: 'neg-exp', x1: 474, y1: 176, x2: 532, y2: 176, fwd: forwardValues.neg, bwd: backwardGradients.neg },
    { id: 'exp-add1c', x1: 574, y1: 176, x2: 632, y2: 176, fwd: forwardValues.exp, bwd: backwardGradients.exp },
    { id: 'add1c-inv', x1: 674, y1: 176, x2: 732, y2: 176, fwd: forwardValues.add1c, bwd: backwardGradients.add1c },
    { id: 'inv-out', x1: 774, y1: 176, x2: 840, y2: 176, fwd: forwardValues.out, bwd: backwardGradients.inv },
    { id: 'out-loss', x1: 882, y1: 176, x2: 945, y2: 176, fwd: forwardValues.out, bwd: backwardGradients.out },
    { id: 'target-loss', x1: 985, y1: 136, x2: 985, y2: 154, fwd: targetValue, bwd: 0 },
    { id: 'loss-box', x1: 1025, y1: 176, x2: 1082, y2: 176, fwd: forwardValues.loss, bwd: 0 }
  ];

  const maxForward = Math.max(...wireDefs.map((wire) => Math.abs(wire.fwd)), 1e-6);
  const maxBackward = Math.max(...wireDefs.map((wire) => Math.abs(wire.bwd)), 1e-6);

  const forwardActive = currentPhase === 'fwd' || (!currentPhase && displayMode !== 'bwd');
  const backwardActive = currentPhase === 'bwd' || (!currentPhase && displayMode !== 'fwd');

  const getLogScaledIntensity = (value, maxValue) => {
    const safeMagnitude = Math.abs(value);
    return Math.log1p(safeMagnitude) / Math.log1p(maxValue);
  };

  const renderFlowWire = (wire) => {
    const forwardIntensity = getLogScaledIntensity(wire.fwd, maxForward);
    const backwardIntensity = getLogScaledIntensity(wire.bwd, maxBackward);

    const phaseClass = currentPhase === 'bwd' ? 'wire-flow-bwd' : 'wire-flow-fwd';
    const opacity = currentPhase === 'bwd'
      ? (backwardActive ? 0.12 + backwardIntensity * 0.78 : 0)
      : (forwardActive ? 0.12 + forwardIntensity * 0.78 : 0);
    const strokeWidth = currentPhase === 'bwd'
      ? (1.2 + backwardIntensity * 4)
      : (1.2 + forwardIntensity * 4);

    return (
      <g key={wire.id}>
        <line className="wire" x1={wire.x1} y1={wire.y1} x2={wire.x2} y2={wire.y2} />
        <line
          className={`wire-flow ${phaseClass}`}
          x1={wire.x1}
          y1={wire.y1}
          x2={wire.x2}
          y2={wire.y2}
          style={{ opacity, strokeWidth }}
        />
      </g>
    );
  };

  const invLocalDerivative = -1 / (forwardValues.add1c ** 2);

  return (
    <main className="canvas-wrap">
      <svg id="circuit" viewBox="0 0 1140 360" xmlns="http://www.w3.org/2000/svg"
           style={{ minWidth: '900px', minHeight: '320px', width: '100%', height: '100%' }}>
        <defs>
          <marker id="arr-bwd" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#ff6b6b" opacity="0.8"/>
          </marker>
          <filter id="glow-loss">
            <feGaussianBlur stdDeviation="3.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glow-out">
            <feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Wires */}
        {wireDefs.map(renderFlowWire)}
        <line x1="945" y1="164" x2="885" y2="164" stroke="#ff6b6b" strokeWidth="1.5"
              strokeDasharray="5,4" markerEnd="url(#arr-bwd)" opacity="0.55"/>
        {(currentPhase === 'bwd' || (!currentPhase && displayMode !== 'fwd')) && (
          <text className="edge-derivative-label" x="703" y="163" textAnchor="middle">
            −1/x² = {formatValue(invLocalDerivative)}
          </text>
        )}

        {/* Input Nodes */}
        <rect x="40" y="41" width="42" height="30" rx="4" fill="var(--surface2)" stroke="var(--highlight)" strokeWidth="1.2"/>
        <text className="input-label" x="61" y="54" style={{ fill: 'var(--highlight)' }}>w₀</text>
        {renderFwdText('nd-w0-f', weights.w0)}
        {renderBwdText('grd-w0', backwardGradients.w0)}

        <rect x="40" y="101" width="42" height="30" rx="4" fill="var(--surface2)" stroke="var(--border)" strokeWidth="1.2"/>
        <text className="input-label" x="61" y="114">x₀</text>
        {renderFwdText('nd-x0-f', inputs.x0)}
        {renderBwdText('grd-x0', backwardGradients.x0)}

        <rect x="40" y="182" width="42" height="30" rx="4" fill="var(--surface2)" stroke="var(--highlight)" strokeWidth="1.2"/>
        <text className="input-label" x="61" y="195" style={{ fill: 'var(--highlight)' }}>w₁</text>
        {renderFwdText('nd-w1-f', weights.w1)}
        {renderBwdText('grd-w1', backwardGradients.w1)}

        <rect x="40" y="242" width="42" height="30" rx="4" fill="var(--surface2)" stroke="var(--border)" strokeWidth="1.2"/>
        <text className="input-label" x="61" y="255">x₁</text>
        {renderFwdText('nd-x1-f', inputs.x1)}
        {renderBwdText('grd-x1', backwardGradients.x1)}

        <rect x="40" y="295" width="42" height="30" rx="4" fill="var(--surface2)" stroke="var(--highlight)" strokeWidth="1.2"/>
        <text className="input-label" x="61" y="308" style={{ fill: 'var(--highlight)' }}>w₂</text>
        {renderFwdText('nd-w2-f', weights.w2)}
        {renderBwdText('grd-w2', backwardGradients.w2)}

        {/* Gates */}
        <g className="gate" data-gate="mul0" data-name="Multiply Gate (w₀·x₀)"
           data-desc="Local gradients swap inputs:&#10;∂/∂w₀ = x₀ · upstream&#10;∂/∂x₀ = w₀ · upstream"
           onMouseEnter={(e) => onGateHover(e, 'mul0', forwardValues, backwardGradients)}
           onMouseMove={(e) => onGateHover(e, 'mul0', forwardValues, backwardGradients)}
           onMouseLeave={onGateLeave}>
          <circle className="gate-circle" cx="232" cy="110" r="21"/>
          <text className="gate-label" x="232" y="110">×</text>
          {renderFwdText('gt-mul0-f', forwardValues.mul0)}
          {renderBwdText('gt-mul0-b', backwardGradients.mul0)}
        </g>

        <g className="gate" data-gate="mul1" data-name="Multiply Gate (w₁·x₁)"
           data-desc="Local gradients swap inputs:&#10;∂/∂w₁ = x₁ · upstream&#10;∂/∂x₁ = w₁ · upstream"
           onMouseEnter={(e) => onGateHover(e, 'mul1', forwardValues, backwardGradients)}
           onMouseMove={(e) => onGateHover(e, 'mul1', forwardValues, backwardGradients)}
           onMouseLeave={onGateLeave}>
          <circle className="gate-circle" cx="232" cy="216" r="21"/>
          <text className="gate-label" x="232" y="216">×</text>
          {renderFwdText('gt-mul1-f', forwardValues.mul1)}
          {renderBwdText('gt-mul1-b', backwardGradients.mul1)}
        </g>

        <g className="gate" data-gate="add" data-name="Add Gate — dot product"
           data-desc="Computes dot product:&#10;dot = w₀x₀ + w₁x₁ + w₂&#10;Gradient distributes equally to all inputs."
           onMouseEnter={(e) => onGateHover(e, 'add', forwardValues, backwardGradients)}
           onMouseMove={(e) => onGateHover(e, 'add', forwardValues, backwardGradients)}
           onMouseLeave={onGateLeave}>
          <circle className="gate-circle" cx="354" cy="176" r="21"/>
          <text className="gate-label" x="354" y="176">+</text>
          {renderFwdText('gt-add-f', forwardValues.add)}
          {renderBwdText('gt-add-b', backwardGradients.add)}
        </g>
        <text x="354" y="147" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fill="#475569">dot</text>

        <g className="gate" data-gate="neg" data-name="Negate Gate (×−1)"
           data-desc="Flips sign. Local gradient = −1.&#10;Gradient also flips sign."
           onMouseEnter={(e) => onGateHover(e, 'neg', forwardValues, backwardGradients)}
           onMouseMove={(e) => onGateHover(e, 'neg', forwardValues, backwardGradients)}
           onMouseLeave={onGateLeave}>
          <circle className="gate-circle" cx="453" cy="176" r="21"/>
          <text className="gate-label" x="453" y="176" style={{ fontSize: '8.5px' }}>×−1</text>
          {renderFwdText('gt-neg-f', forwardValues.neg)}
          {renderBwdText('gt-neg-b', backwardGradients.neg)}
        </g>

        <g className="gate" data-gate="exp" data-name="Exponential Gate (eˣ)"
           data-desc="Local gradient = eˣ&#10;(same as output value!)"
           onMouseEnter={(e) => onGateHover(e, 'exp', forwardValues, backwardGradients)}
           onMouseMove={(e) => onGateHover(e, 'exp', forwardValues, backwardGradients)}
           onMouseLeave={onGateLeave}>
          <circle className="gate-circle" cx="553" cy="176" r="21"/>
          <text className="gate-label" x="553" y="176" style={{ fontSize: '9px' }}>exp</text>
          {renderFwdText('gt-exp-f', forwardValues.exp)}
          {renderBwdText('gt-exp-b', backwardGradients.exp)}
        </g>

        <g className="gate" data-gate="add1c" data-name="Add Constant +1"
           data-desc="Passes gradient unchanged.&#10;Local gradient = 1."
           onMouseEnter={(e) => onGateHover(e, 'add1c', forwardValues, backwardGradients)}
           onMouseMove={(e) => onGateHover(e, 'add1c', forwardValues, backwardGradients)}
           onMouseLeave={onGateLeave}>
          <circle className="gate-circle" cx="653" cy="176" r="21"/>
          <text className="gate-label" x="653" y="176" style={{ fontSize: '9px' }}>+1</text>
          {renderFwdText('gt-add1c-f', forwardValues.add1c)}
          {renderBwdText('gt-add1c-b', backwardGradients.add1c)}
        </g>

        <g className="gate" data-gate="inv" data-name="Inverse Gate (1/x)"
           data-desc="Local gradient = −1/x²&#10;Produces sigmoid output σ(dot)."
           onMouseEnter={(e) => onGateHover(e, 'inv', forwardValues, backwardGradients)}
           onMouseMove={(e) => onGateHover(e, 'inv', forwardValues, backwardGradients)}
           onMouseLeave={onGateLeave}>
          <circle className="gate-circle" cx="753" cy="176" r="21"/>
          <text className="gate-label" x="753" y="176" style={{ fontSize: '9px' }}>1/x</text>
          {renderFwdText('gt-inv-f', forwardValues.out)}
          {renderBwdText('gt-inv-b', backwardGradients.out)}
        </g>
        <text x="753" y="147" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fill="#475569">σ(dot)=ŷ</text>

        {/* Output Box */}
        <rect x="840" y="158" width="42" height="36" rx="5" fill="var(--surface2)" stroke="var(--fwd)" strokeWidth="1.5" filter="url(#glow-out)"/>
        <text x="861" y="171" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fill="var(--fwd)">ŷ</text>
        <text className={`val-fwd ${flashingElements['nd-out'] || ''}`} id="nd-out" x="861" y="185" style={{ fontSize: '11px', fontWeight: 700 }}>
          {formatValue(forwardValues.out)}
        </text>

        {/* Target */}
        <rect x="959" y="108" width="52" height="26" rx="4" fill="var(--surface2)" stroke="var(--target)" strokeWidth="1.3"/>
        <text x="985" y="118" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="var(--target)">target</text>
        <text className="val-tgt" id="nd-tgt" x="985" y="130">{formatValue(targetValue)}</text>

        {/* Loss Gate */}
        <g className="gate" data-gate="loss" data-name="MSE Loss Gate"
           data-desc="L = (ŷ − y)²&#10;∂L/∂ŷ = 2(ŷ − y)&#10;Gradient pushes output toward target."
           onMouseEnter={(e) => onGateHover(e, 'loss', forwardValues, backwardGradients)}
           onMouseMove={(e) => onGateHover(e, 'loss', forwardValues, backwardGradients)}
           onMouseLeave={onGateLeave}>
          <circle cx="985" cy="176" r="24" fill="var(--surface2)" stroke="var(--loss)" strokeWidth="2" filter="url(#glow-loss)"/>
          <text x="985" y="171" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fill="var(--loss)" fontWeight="700">MSE</text>
          <text x="985" y="182" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill="var(--loss)">(ŷ−y)²</text>
        </g>
        {renderBwdText('gt-loss-b', backwardGradients.out)}
        <text className={flashingElements['lbl-dLdout'] || ''} id="lbl-dLdout" x="915" y="159" textAnchor="middle"
              fontFamily="JetBrains Mono" fontSize="8" fill="#ff6b6b" opacity="0.8">
          ∂L/∂ŷ={formatValue(backwardGradients.out)}
        </text>

        {/* Final Loss Box */}
        <rect x="1042" y="158" width="80" height="36" rx="6" fill="var(--surface2)" stroke="var(--loss)" strokeWidth="1.8" filter="url(#glow-loss)"/>
        <text x="1082" y="171" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="var(--loss)">Loss L</text>
        <text className="val-loss" id="nd-loss" x="1082" y="187" style={{ fontSize: '12px', fontWeight: 700 }}>
          {formatValue(forwardValues.loss)}
        </text>

        {/* Sigmoid bracket label */}
        <path d="M432,235 Q432,265 653,265 Q874,265 874,235" fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="3,3"/>
        <text x="653" y="281" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7.5" fill="#334155">
          ── σ(x) = 1/(1+e⁻ˣ) ──
        </text>
      </svg>
    </main>
  );
};

export default CircuitSVG;
