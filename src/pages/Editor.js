import React from 'react';
import FontTest from '../components/FontTest';

const Editor = () => {
  return (
    <div className="py-8">
      <h1 className="text-4xl font-caveat text-center mb-8">Writurr</h1>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <FontTest />
      </div>
    </div>
  );
};

export default Editor;