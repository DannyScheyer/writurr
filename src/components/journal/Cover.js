import React from 'react';

const Cover = ({ style, onOpen }) => {
  return (
    <div 
      className="relative bg-white w-full aspect-[8.5/11] shadow-lg rounded cursor-pointer"
      onClick={onOpen}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <h2 className="text-2xl font-caveat">Click to open</h2>
      </div>
    </div>
  );
};

export default Cover;