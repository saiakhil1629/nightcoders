import React from 'react';

const GlassCard = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`glass-panel glass-panel-hover rounded-2xl p-6 transition-all duration-300 ${className} ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
