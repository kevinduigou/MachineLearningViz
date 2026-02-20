import { useEffect, useRef } from 'react';
import { formatLossValue, formatChartAxisLabel } from '../utils/formatting';

const LossChart = ({ lossHistory, currentEpoch, hasConverged }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    const header = parent.querySelector('.chart-header');
    const footer = parent.querySelector('.chart-foot');
    
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight - header.offsetHeight - footer.offsetHeight;

    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#0a0c10';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    if (lossHistory.length < 2) {
      ctx.fillStyle = '#334155';
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText('press ▶ Train to start', canvasWidth / 2, canvasHeight / 2 - 8);
      ctx.font = '9px JetBrains Mono';
      ctx.fillStyle = '#1e293b';
      ctx.fillText('or adjust weights manually', canvasWidth / 2, canvasHeight / 2 + 8);
      return;
    }

    const padding = { t: 14, r: 10, b: 26, l: 42 };
    const chartWidth = canvasWidth - padding.l - padding.r;
    const chartHeight = canvasHeight - padding.t - padding.b;
    const maxLoss = Math.max(...lossHistory) * 1.08 || 0.01;

    // Grid
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.t + chartHeight * i / 4;
      ctx.strokeStyle = '#1a1f2e';
      ctx.beginPath();
      ctx.moveTo(padding.l, y);
      ctx.lineTo(padding.l + chartWidth, y);
      ctx.stroke();
      
      const value = maxLoss * (1 - i / 4);
      ctx.fillStyle = '#334155';
      ctx.font = '8px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.fillText(formatChartAxisLabel(value), padding.l - 4, y + 3);
    }

    // Zero line
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(56,189,248,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.l, padding.t + chartHeight);
    ctx.lineTo(padding.l + chartWidth, padding.t + chartHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    // Area fill
    const gradient = ctx.createLinearGradient(0, padding.t, 0, padding.t + chartHeight);
    gradient.addColorStop(0, 'rgba(245,158,11,0.35)');
    gradient.addColorStop(1, 'rgba(245,158,11,0.02)');

    const points = lossHistory.map((loss, index) => ({
      x: padding.l + (index / (lossHistory.length - 1)) * chartWidth,
      y: padding.t + chartHeight - (loss / maxLoss) * chartHeight
    }));

    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.lineTo(points[points.length - 1].x, padding.t + chartHeight);
    ctx.lineTo(points[0].x, padding.t + chartHeight);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Latest dot
    const lastPoint = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(lastPoint.x, lastPoint.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    // X axis labels
    ctx.fillStyle = '#334155';
    ctx.font = '8px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.fillText('0', padding.l, canvasHeight - 6);
    ctx.textAlign = 'right';
    ctx.fillText('epoch ' + lossHistory.length, padding.l + chartWidth, canvasHeight - 6);
  }, [lossHistory]);

  const currentLoss = lossHistory.length > 0 ? lossHistory[lossHistory.length - 1] : 0;
  const minLoss = lossHistory.length > 0 ? Math.min(...lossHistory) : 0;

  return (
    <div className="right-panel">
      <div className="chart-header">
        <span>Loss Curve</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {hasConverged && <span className="converged">✓ Converged</span>}
          <span className="epoch-badge">epoch {currentEpoch}</span>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ flex: 1 }}></canvas>
      <div className="chart-foot">
        <span style={{ color: 'var(--loss)' }}>L = {formatLossValue(currentLoss)}</span>
        <span style={{ color: 'var(--muted)' }}>min {formatLossValue(minLoss)}</span>
      </div>
    </div>
  );
};

export default LossChart;
