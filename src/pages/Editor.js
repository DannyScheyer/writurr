import React from 'react';
import Journal from '../components/journal/Journal';

const Editor = () => {
  return (
    <div className="py-8">
      <h1 className="text-4xl font-caveat text-center mb-8">Writurr</h1>
      <div className="px-4">
        <Journal />
      </div>
    </div>
  );
};

export default Editor;