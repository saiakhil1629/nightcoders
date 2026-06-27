import React from 'react';

const StreakFlame = ({ count = 0, className = '' }) => {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-950/20 border border-orange-500/20 text-accent-streak ${className}`} title={`${count} Day Consistency Streak!`}>
      <svg 
        className="w-5 h-5 animate-flame fill-current text-accent-streak" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2C11.38 2 10.82 2.37 10.58 2.94C8.63 7.57 6.43 9.4 6 12C5.55 14.7 7.22 17.5 10 18.5C6.46 17.38 5 13.9 6.5 10.5C5.43 12 5.09 14.15 6 16C5.07 14.72 4.97 12.3 6.09 10C5.33 11 5 12.5 5 13.5C5 17.09 7.91 20 11.5 20C15.09 20 18 17.09 18 13.5C18 9.3 14 6.5 12.5 4.5C13.5 5.5 14.5 7.5 14 9.5C15.8 7.27 15.2 4.07 12 2Z"/>
      </svg>
      <span className="font-display font-bold text-sm tracking-wide">{count} Days</span>
    </div>
  );
};

export default StreakFlame;
