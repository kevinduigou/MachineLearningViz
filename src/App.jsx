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
  appendToLossHistory,
  computeBatchMetrics
} from './utils/computation';
import { formatValue } from './utils/formatting';

const TRAIN_INTERVAL_MS = 50;
const DEFAULT_CONVERGENCE_THRESHOLD = 1e-6;
const MAX_STEP_LOGS = 40;

const TRAINING_MODES = {
  sgd: 'sgd',
  fullBatch: 'full-batch'
};

const MINI_DATASET = [
  { x0: -2.0, x1: -1.2, y: 0.05 },
  { x0: -1.3, x1: 0.7, y: 0.18 },
  { x0: -0.8, x1: -2.1, y: 0.12 },
  { x0: 0.2, x1: -0.7, y: 0.38 },
  { x0: 0.9, x1: 0.4, y: 0.67 },
  { x0: 1.3, x1: -0.4, y: 0.62 },
  { x0: 1.9, x1: 1.2, y: 0.92 },
  { x0: 2.4, x1: 0.1, y: 0.88 }
];

const FLASH_IDS = {
  fwd: ['nd-w0-f', 'nd-x0-f', 'nd-w1-f', 'nd-x1-f', 'nd-w2-f',
    'gt-mul0-f', 'gt-mul1-f', 'gt-add-f', 'gt-neg-f', 'gt-exp-f', 'gt-add1c-f', 'gt-inv-f', 'nd-out'],
  bwd: ['lbl-dLdout', 'gt-loss-b', 'gt-inv-b', 'gt-add1c-b', 'gt-exp-b',
    'gt-neg-b', 'gt-add-b', 'gt-mul0-b', 'gt-mul1-b',
    'grd-w0', 'grd-w1', 'grd-w2', 'grd-x0', 'grd-x1'],
  upd: ['nd-w0-f', 'nd-w1-f', 'nd-w2-f']
};

const App = () => {
  const [weights, setWeights] = useState({ w0: 2, w1: -3, w2: -3 });
  const [currentSampleIndex, setCurrentSampleIndex] = useState(0);
  const [inputs, setInputs] = useState({ x0: MINI_DATASET[0].x0, x1: MINI_DATASET[0].x1 });
  const [targetValue, setTargetValue] = useState(MINI_DATASET[0].y);
  const [trainingMode, setTrainingMode] = useState(TRAINING_MODES.sgd);
  const [learningRate, setLearningRate] = useState(0.7);
  const [convergenceThreshold, setConvergenceThreshold] = useState(DEFAULT_CONVERGENCE_THRESHOLD);
  const [displayMode, setDisplayMode] = useState('both');

  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [lossHistory, setLossHistory] = useState([]);
  const [hasConverged, setHasConverged] = useState(false);
  const [sampleLosses, setSampleLosses] = useState([]);

  const [isStepping, setIsStepping] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [stepLogs, setStepLogs] = useState([]);
  const [flashingElements, setFlashingElements] = useState({});

  const trainingIntervalRef = useRef(null);
  const lastTrainTimeRef = useRef(0);
  const savedDisplayModeRef = useRef('both');

  const tooltip = Tooltip();

  const activeSample = MINI_DATASET[currentSampleIndex];
  const { forwardValues, backwardGradients } = computeForwardBackward(weights, inputs, targetValue);

  const trainingBatch = trainingMode === TRAINING_MODES.fullBatch
    ? MINI_DATASET
    : [activeSample];

  const { averageLoss, sampleLosses: computedSampleLosses } = computeBatchMetrics(weights, trainingBatch);
  const renderedSampleLosses = sampleLosses.length ? sampleLosses : computedSampleLosses;

  useEffect(() => {
    if (!isTraining) return;

    const animate = (timestamp) => {
      if (timestamp - lastTrainTimeRef.current >= TRAIN_INTERVAL_MS) {
        lastTrainTimeRef.current = timestamp;

        setWeights(currentWeights => {
          const batch = trainingMode === TRAINING_MODES.fullBatch
            ? MINI_DATASET
            : [MINI_DATASET[currentSampleIndex]];
          const { averageGradients: grads } = computeBatchMetrics(currentWeights, batch);
          return applyGradientDescent(currentWeights, grads, learningRate);
        });

        const nextSampleIndex = (currentSampleIndex + 1) % MINI_DATASET.length;
        if (trainingMode === TRAINING_MODES.sgd) {
          setCurrentSampleIndex(nextSampleIndex);
          const nextSample = MINI_DATASET[nextSampleIndex];
          setInputs({ x0: nextSample.x0, x1: nextSample.x1 });
          setTargetValue(nextSample.y);
        }

        const nextBatch = trainingMode === TRAINING_MODES.fullBatch ? MINI_DATASET : [MINI_DATASET[nextSampleIndex]];
        const { averageLoss: nextAverageLoss, sampleLosses: nextSampleLosses } = computeBatchMetrics(weights, nextBatch);
        setLossHistory(history => appendToLossHistory(history, nextAverageLoss));
        setSampleLosses(nextSampleLosses);
        setCurrentEpoch(epoch => epoch + 1);

        if (nextAverageLoss < convergenceThreshold) {
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
  }, [isTraining, weights, learningRate, trainingMode, currentSampleIndex, convergenceThreshold]);

  const handleWeightChange = useCallback((weightKey, value) => {
    setWeights(prev => ({ ...prev, [weightKey]: value }));
    if (!isTraining) {
      setLossHistory([]);
      setCurrentEpoch(0);
    }
  }, [isTraining]);

  const handleTrainingModeChange = useCallback((mode) => {
    setTrainingMode(mode);
    setIsTraining(false);
    setHasConverged(false);
    setCurrentEpoch(0);
    setLossHistory([]);

    if (mode === TRAINING_MODES.fullBatch) {
      const { averageLoss: initialAverageLoss, sampleLosses: initialSampleLosses } = computeBatchMetrics(weights, MINI_DATASET);
      setSampleLosses(initialSampleLosses);
      setLossHistory([initialAverageLoss]);
      return;
    }

    const sample = MINI_DATASET[currentSampleIndex];
    setInputs({ x0: sample.x0, x1: sample.x1 });
    setTargetValue(sample.y);
    const { averageLoss: initialAverageLoss, sampleLosses: initialSampleLosses } = computeBatchMetrics(weights, [sample]);
    setSampleLosses(initialSampleLosses);
    setLossHistory([initialAverageLoss]);
  }, [weights, currentSampleIndex]);

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
      return;
    }

    setIsTraining(true);
    lastTrainTimeRef.current = 0;
    setCurrentPhase(null);
  }, [isTraining]);

  const handleReset = useCallback(() => {
    setIsTraining(false);
    const randomized = generateRandomWeights();
    setWeights(randomized);
    setCurrentEpoch(0);
    setHasConverged(false);
    setCurrentPhase(null);
    setCurrentSampleIndex(0);
    setInputs({ x0: MINI_DATASET[0].x0, x1: MINI_DATASET[0].x1 });
    setTargetValue(MINI_DATASET[0].y);

    const batch = trainingMode === TRAINING_MODES.fullBatch ? MINI_DATASET : [MINI_DATASET[0]];
    const { averageLoss: resetAverageLoss, sampleLosses: resetSampleLosses } = computeBatchMetrics(randomized, batch);
    setLossHistory([resetAverageLoss]);
    setSampleLosses(resetSampleLosses);
    setStepLogs(['<span style="color:var(--muted)">Weights randomized. Use ⏭ Step or ▶ Train.</span>']);
  }, [trainingMode]);

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
    const batch = trainingMode === TRAINING_MODES.fullBatch ? MINI_DATASET : [MINI_DATASET[currentSampleIndex]];
    const { averageGradients: stepGradients, averageLoss: stepAverageLoss } = computeBatchMetrics(weights, batch);

    setCurrentPhase('fwd');
    setDisplayMode('fwd');
    flashElements(FLASH_IDS.fwd, 'flash-fwd');

    setTimeout(() => {
      setCurrentPhase('bwd');
      setDisplayMode('bwd');
      flashElements(FLASH_IDS.bwd, 'flash-bwd');

      setTimeout(() => {
        setCurrentPhase('upd');
        setDisplayMode(savedDisplayModeRef.current);

        const updatedWeights = applyGradientDescent(weights, stepGradients, learningRate);
        setWeights(updatedWeights);
        setCurrentEpoch(epoch => epoch + 1);

        const { averageLoss: nextAverageLoss, sampleLosses: nextSampleLosses } = computeBatchMetrics(updatedWeights, batch);
        setLossHistory(history => appendToLossHistory(history, nextAverageLoss));
        setSampleLosses(nextSampleLosses);

        flashElements(FLASH_IDS.upd, 'flash-upd');

        addStepLog(
          `<span class="log-epoch">Epoch ${currentEpoch + 1}</span> &nbsp;` +
          `<span class="log-fwd">ŷ=${formatValue(fwd.out)}</span> &nbsp;` +
          `<span class="log-bwd">∂L/∂w₀=${formatValue(bwd.w0)}</span> &nbsp;` +
          `<span class="log-upd">Δw₀=${formatValue(-learningRate * stepGradients.w0)}</span>`
        );
        addStepLog(
          `&nbsp;&nbsp;&nbsp;` +
          `<span class="log-fwd">L=${formatValue(fwd.loss)}</span> &nbsp;` +
          `<span class="log-bwd">∂L/∂w₁=${formatValue(bwd.w1)}</span> &nbsp;` +
          `<span class="log-upd">Δw₁=${formatValue(-learningRate * stepGradients.w1)}</span>`
        );
        addStepLog(
          `&nbsp;&nbsp;&nbsp;` +
          `<span style="color:var(--loss)">L̄=${formatValue(stepAverageLoss)} → ${formatValue(nextAverageLoss)}</span> &nbsp;` +
          `<span class="log-bwd">∂L/∂w₂=${formatValue(bwd.w2)}</span> &nbsp;` +
          `<span class="log-upd">Δw₂=${formatValue(-learningRate * stepGradients.w2)}</span>`
        );

        if (nextAverageLoss < convergenceThreshold) {
          setHasConverged(true);
          addStepLog('<span style="color:var(--fwd)">✓ Converged!</span>');
        }

        setTimeout(() => {
          setCurrentPhase(null);
          setIsStepping(false);
        }, 500);
      }, 700);
    }, 700);
  }, [isStepping, isTraining, displayMode, weights, inputs, targetValue, learningRate, currentEpoch, flashElements, addStepLog, convergenceThreshold, trainingMode, currentSampleIndex]);

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
        averageLoss={averageLoss}
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
          trainingMode={trainingMode}
          currentSampleIndex={currentSampleIndex}
          datasetSize={MINI_DATASET.length}
          averageLoss={averageLoss}
          sampleLosses={renderedSampleLosses}
          learningRate={learningRate}
          convergenceThreshold={convergenceThreshold}
          displayMode={displayMode}
          forwardValues={forwardValues}
          backwardGradients={backwardGradients}
          stepLogs={stepLogs}
          onWeightChange={handleWeightChange}
          onTrainingModeChange={handleTrainingModeChange}
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
          averageLoss={averageLoss}
          sampleLosses={renderedSampleLosses}
        />
      </div>
      <tooltip.TooltipComponent />
    </>
  );
};

export default App;
