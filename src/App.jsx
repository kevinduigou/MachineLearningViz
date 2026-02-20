import { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import LeftPanel from './components/LeftPanel';
import CircuitSVG from './components/CircuitSVG';
import LossChart from './components/RightPanel';
import Tooltip from './components/Tooltip';
import { 
  computeForwardBackward, 
  applyGradientDescent, 
  generateRandomWeights,
  appendToLossHistory 
} from './utils/computation';
import { formatValue } from './utils/formatting';

const TRAIN_INTERVAL_MS = 50;
const DEFAULT_CONVERGENCE_THRESHOLD = 1e-6;
const MAX_STEP_LOGS = 40;

const FLASH_IDS = {
  fwd: ['nd-w0-f', 'nd-x0-f', 'nd-w1-f', 'nd-x1-f', 'nd-w2-f',
        'gt-mul0-f', 'gt-mul1-f', 'gt-add-f', 'gt-neg-f', 'gt-exp-f', 'gt-add1c-f', 'gt-inv-f', 'nd-out'],
  bwd: ['lbl-dLdout', 'gt-loss-b', 'gt-inv-b', 'gt-add1c-b', 'gt-exp-b',
        'gt-neg-b', 'gt-add-b', 'gt-mul0-b', 'gt-mul1-b',
        'grd-w0', 'grd-w1', 'grd-w2', 'grd-x0', 'grd-x1'],
  upd: ['nd-w0-f', 'nd-w1-f', 'nd-w2-f']
};

const App = () => {
  // Core state
  const [weights, setWeights] = useState({ w0: 2, w1: -3, w2: -3 });
  const [inputs, setInputs] = useState({ x0: -1, x1: -2 });
  const [targetValue, setTargetValue] = useState(0.8);
  const [learningRate, setLearningRate] = useState(1.0);
  const [convergenceThreshold, setConvergenceThreshold] = useState(DEFAULT_CONVERGENCE_THRESHOLD);
  const [displayMode, setDisplayMode] = useState('both');
  
  // Training state
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [lossHistory, setLossHistory] = useState([]);
  const [hasConverged, setHasConverged] = useState(false);
  
  // Step mode state
  const [isStepping, setIsStepping] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [stepLogs, setStepLogs] = useState([]);
  const [flashingElements, setFlashingElements] = useState({});
  
  // Refs
  const trainingIntervalRef = useRef(null);
  const lastTrainTimeRef = useRef(0);
  const savedDisplayModeRef = useRef('both');
  
  // Tooltip
  const tooltip = Tooltip();

  // Compute current forward and backward values
  const { forwardValues, backwardGradients } = computeForwardBackward(weights, inputs, targetValue);

  // Training loop
  useEffect(() => {
    if (!isTraining) return;

    const animate = (timestamp) => {
      if (timestamp - lastTrainTimeRef.current >= TRAIN_INTERVAL_MS) {
        lastTrainTimeRef.current = timestamp;

        setWeights(currentWeights => {
          const { backwardGradients: gradients } = computeForwardBackward(currentWeights, inputs, targetValue);
          return applyGradientDescent(currentWeights, gradients, learningRate);
        });

        setCurrentEpoch(epoch => epoch + 1);

        const { forwardValues: newForward } = computeForwardBackward(weights, inputs, targetValue);
        setLossHistory(history => appendToLossHistory(history, newForward.loss));

        if (newForward.loss < convergenceThreshold) {
          setHasConverged(true);
          setIsTraining(false);
        }
      }

      if (isTraining) {
        trainingIntervalRef.current = requestAnimationFrame(animate);
      }
    };

    trainingIntervalRef.current = requestAnimationFrame(animate);

    return () => {
      if (trainingIntervalRef.current) {
        cancelAnimationFrame(trainingIntervalRef.current);
      }
    };
  }, [isTraining, inputs, targetValue, learningRate, convergenceThreshold, weights]);

  // Handlers
  const handleWeightChange = useCallback((weightKey, value) => {
    setWeights(prev => ({ ...prev, [weightKey]: value }));
    if (!isTraining) {
      setLossHistory([]);
      setCurrentEpoch(0);
    }
  }, [isTraining]);

  const handleInputChange = useCallback((inputKey, value) => {
    setInputs(prev => ({ ...prev, [inputKey]: value }));
  }, []);

  const handleTargetChange = useCallback((value) => {
    setTargetValue(value);
    setLossHistory([]);
    setCurrentEpoch(0);
    setHasConverged(false);
  }, []);

  const handleLearningRateChange = useCallback((value) => {
    setLearningRate(value);
  }, []);

  const handleConvergenceThresholdChange = useCallback((value) => {
    setConvergenceThreshold(value);
  }, []);

  const handleDisplayModeChange = useCallback((mode) => {
    setDisplayMode(mode);
  }, []);

  const handleToggleTraining = useCallback(() => {
    if (isTraining) {
      setIsTraining(false);
      setCurrentPhase(null);
    } else {
      setIsTraining(true);
      lastTrainTimeRef.current = 0;
      setCurrentPhase(null);
    }
  }, [isTraining]);

  const handleReset = useCallback(() => {
    setIsTraining(false);
    setWeights(generateRandomWeights());
    setCurrentEpoch(0);
    setLossHistory([]);
    setHasConverged(false);
    setCurrentPhase(null);
    setStepLogs(['<span style="color:var(--muted)">Weights randomized. Use ⏭ Step or ▶ Train.</span>']);
  }, []);

  const addStepLog = useCallback((logHtml) => {
    setStepLogs(logs => {
      const updatedLogs = [...logs, logHtml];
      return updatedLogs.length > MAX_STEP_LOGS 
        ? updatedLogs.slice(updatedLogs.length - MAX_STEP_LOGS)
        : updatedLogs;
    });
  }, []);

  const flashElements = useCallback((elementIds, flashClass) => {
    const flashMap = {};
    elementIds.forEach(id => {
      flashMap[id] = flashClass;
    });
    setFlashingElements(flashMap);
    
    setTimeout(() => {
      setFlashingElements({});
    }, 600);
  }, []);

  const handleStep = useCallback(() => {
    if (isStepping || isTraining) return;
    
    setIsStepping(true);
    savedDisplayModeRef.current = displayMode;

    const { forwardValues: fwd, backwardGradients: bwd } = computeForwardBackward(weights, inputs, targetValue);

    // Phase 1: Forward
    setCurrentPhase('fwd');
    setDisplayMode('fwd');
    flashElements(FLASH_IDS.fwd, 'flash-fwd');

    setTimeout(() => {
      // Phase 2: Backward
      setCurrentPhase('bwd');
      setDisplayMode('bwd');
      flashElements(FLASH_IDS.bwd, 'flash-bwd');

      setTimeout(() => {
        // Phase 3: Update
        setCurrentPhase('upd');
        setDisplayMode(savedDisplayModeRef.current);

        const updatedWeights = applyGradientDescent(weights, bwd, learningRate);
        setWeights(updatedWeights);
        setCurrentEpoch(epoch => epoch + 1);

        const { forwardValues: fwd2 } = computeForwardBackward(updatedWeights, inputs, targetValue);
        setLossHistory(history => appendToLossHistory(history, fwd2.loss));

        flashElements(FLASH_IDS.upd, 'flash-upd');

        // Add logs
        addStepLog(
          `<span class="log-epoch">Epoch ${currentEpoch + 1}</span> &nbsp;` +
          `<span class="log-fwd">ŷ=${formatValue(fwd.out)}</span> &nbsp;` +
          `<span class="log-bwd">∂L/∂w₀=${formatValue(bwd.w0)}</span> &nbsp;` +
          `<span class="log-upd">Δw₀=${formatValue(-learningRate * bwd.w0)}</span>`
        );
        addStepLog(
          `&nbsp;&nbsp;&nbsp;` +
          `<span class="log-fwd">L=${formatValue(fwd.loss)}</span> &nbsp;` +
          `<span class="log-bwd">∂L/∂w₁=${formatValue(bwd.w1)}</span> &nbsp;` +
          `<span class="log-upd">Δw₁=${formatValue(-learningRate * bwd.w1)}</span>`
        );
        addStepLog(
          `&nbsp;&nbsp;&nbsp;` +
          `<span style="color:var(--loss)">L'=${formatValue(fwd2.loss)}</span> &nbsp;` +
          `<span class="log-bwd">∂L/∂w₂=${formatValue(bwd.w2)}</span> &nbsp;` +
          `<span class="log-upd">Δw₂=${formatValue(-learningRate * bwd.w2)}</span>`
        );

        if (fwd2.loss < convergenceThreshold) {
          setHasConverged(true);
          addStepLog('<span style="color:var(--fwd)">✓ Converged!</span>');
        }

        setTimeout(() => {
          setCurrentPhase(null);
          setIsStepping(false);
        }, 500);
      }, 700);
    }, 700);
  }, [isStepping, isTraining, displayMode, weights, inputs, targetValue, learningRate, convergenceThreshold, currentEpoch, flashElements, addStepLog]);

  const handleGateHover = useCallback((event, gateKey, fwdValues, bwdValues) => {
    const target = event.currentTarget;
    const gateName = target.dataset.name || '';
    const gateDesc = target.dataset.desc || '';
    
    const fwdValue = gateKey in fwdValues ? `<br><span style="color:var(--fwd)">fwd: ${formatValue(fwdValues[gateKey])}</span>` : '';
    const bwdValue = gateKey in bwdValues ? `&nbsp;<span style="color:var(--bwd)">grad: ${formatValue(bwdValues[gateKey])}</span>` : '';
    
    const content = `<strong>${gateName}</strong>${gateDesc.replace(/\n/g, '<br>')}${fwdValue}${bwdValue}`;
    
    tooltip.show(content, event.clientX, event.clientY);
  }, [tooltip]);

  const handleGateLeave = useCallback(() => {
    tooltip.hide();
  }, [tooltip]);

  return (
    <>
      <Header
        forwardValues={forwardValues}
        targetValue={targetValue}
        currentPhase={currentPhase}
        isTraining={isTraining}
        isStepping={isStepping}
        onStep={handleStep}
        onReset={handleReset}
        onToggleTraining={handleToggleTraining}
      />
      <div className="layout">
        <LeftPanel
          weights={weights}
          inputs={inputs}
          targetValue={targetValue}
          learningRate={learningRate}
          convergenceThreshold={convergenceThreshold}
          displayMode={displayMode}
          forwardValues={forwardValues}
          backwardGradients={backwardGradients}
          stepLogs={stepLogs}
          onWeightChange={handleWeightChange}
          onInputChange={handleInputChange}
          onTargetChange={handleTargetChange}
          onLearningRateChange={handleLearningRateChange}
          onConvergenceThresholdChange={handleConvergenceThresholdChange}
          onDisplayModeChange={handleDisplayModeChange}
        />
        <CircuitSVG
          weights={weights}
          inputs={inputs}
          targetValue={targetValue}
          forwardValues={forwardValues}
          backwardGradients={backwardGradients}
          displayMode={displayMode}
          flashingElements={flashingElements}
          onGateHover={handleGateHover}
          onGateLeave={handleGateLeave}
        />
        <LossChart
          lossHistory={lossHistory}
          currentEpoch={currentEpoch}
          hasConverged={hasConverged}
        />
      </div>
      <tooltip.TooltipComponent />
    </>
  );
};

export default App;
