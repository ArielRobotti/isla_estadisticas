import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle: string;
  dotColor: 'blue' | 'gold' | 'purple' | 'green' | 'orange' | 'pink';
  isFull?: boolean;
  isTall?: boolean;
  children: React.ReactNode;
  noData?: boolean;
  noDataIcon?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ 
  title, subtitle, dotColor, isFull, isTall, children, noData, noDataIcon 
}) => {
  return (
    <div className={`cc ${isFull ? 'full' : ''}`}>
      <div className="cc-title">
        <div className={`dot ${dotColor}`}></div>
        {title}
      </div>
      <div className="cc-sub">{subtitle}</div>
      <div className={`cw ${isTall ? 'tall' : ''}`}>
        {!noData ? children : (
          <div className="no-data">
            <div className="ni">{noDataIcon}</div>
            Sin datos
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartCard;