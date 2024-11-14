import React, { useState } from 'react';
import Page from './Page';
import Cover from './Cover';

const Journal = ({ style = 'college-ruled' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {!isOpen ? (
        <Cover 
          style={style} 
          onOpen={() => setIsOpen(true)}
        />
      ) : (
        <div className="relative">
          <Page 
            style={style}
            pageNumber={currentPage + 1}
          />
        </div>
      )}
    </div>
  );
};

export default Journal;