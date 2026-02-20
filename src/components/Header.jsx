import { formatValue } from '../utils/formatting';

const Header = ({ 
  forwardValues, 
  targetValue, 
  currentPhase, 
  isTraining, 
  isStepping,
  onStep, 
  onReset, 
  onToggleTraining 
}) => {
  const trainButtonText = isTraining ? '■ Stop' : '▶ Train';
  const trainButtonClass = isTraining ? 'train-btn running' : 'train-btn';

  return (
    <header>
      <div className="header-left">
        <h1>∇ Backprop + Training</h1>
        <span className="header-sub">2-input sigmoid neuron · MSE loss</span>
      </div>
      <div className="header-right">
        <div className="loss-badge">
          <div>
            <span className="lkey">output</span>
            <span className="lval-out">{formatValue(forwardValues.out)}</span>
          </div>
          <div>
            <span className="lkey">target</span>
            <span className="lval-tgt">{formatValue(targetValue)}</span>
          </div>
          <div>
            <span className="lkey">loss</span>
            <span className="lval-loss">{formatValue(forwardValues.loss)}</span>
          </div>
        </div>
        <div className="phase-strip">
          <div className={`phase-pill ${currentPhase === 'fwd' ? 'active-fwd' : ''}`}>
            ① Forward
          </div>
          <div className="phase-sep"></div>
          <div className={`phase-pill ${currentPhase === 'bwd' ? 'active-bwd' : ''}`}>
            ② Backward
          </div>
          <div className="phase-sep"></div>
          <div className={`phase-pill ${currentPhase === 'upd' ? 'active-upd' : ''}`}>
            ③ Update w
          </div>
        </div>
        <button 
          className="step-btn" 
          onClick={onStep}
          disabled={isStepping || isTraining}
        >
          ⏭ Step
        </button>
        <button className="reset-btn" onClick={onReset}>
          Randomize
        </button>
        <button className={trainButtonClass} onClick={onToggleTraining}>
          {trainButtonText}
        </button>
      </div>
    </header>
  );
};

export default Header;
