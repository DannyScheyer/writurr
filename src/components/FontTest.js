import React from 'react';

const FontTest = () => {
  return (
    <div className="space-y-4">
      <p className="font-caveat text-2xl" style={{ fontFamily: 'Caveat, cursive' }}>This is Caveat font</p>
      <p className="font-reenie text-2xl" style={{ fontFamily: 'Reenie Beanie, cursive' }}>This is Reenie Beanie font</p>
      <p className="font-meddon text-2xl" style={{ fontFamily: 'Meddon, cursive' }}>This is Meddon font</p>
      <p className="font-marker text-2xl" style={{ fontFamily: 'Permanent Marker, cursive' }}>This is Permanent Marker font</p>
      <p className="font-amatic text-2xl" style={{ fontFamily: 'Amatic SC, cursive' }}>This is Amatic SC font</p>
    </div>
  );
};

export default FontTest;