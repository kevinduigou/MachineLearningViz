import { useState } from 'react';

const Tooltip = () => {
  const [tooltipState, setTooltipState] = useState({
    visible: false,
    content: '',
    x: 0,
    y: 0
  });

  const show = (content, x, y) => {
    setTooltipState({ visible: true, content, x, y });
  };

  const hide = () => {
    setTooltipState(prev => ({ ...prev, visible: false }));
  };

  const move = (x, y) => {
    setTooltipState(prev => ({ ...prev, x, y }));
  };

  return {
    show,
    hide,
    move,
    TooltipComponent: () => (
      <div
        className={`tooltip ${tooltipState.visible ? 'visible' : ''}`}
        style={{
          left: `${tooltipState.x + 14}px`,
          top: `${tooltipState.y - 10}px`
        }}
        dangerouslySetInnerHTML={{ __html: tooltipState.content }}
      />
    )
  };
};

export default Tooltip;
