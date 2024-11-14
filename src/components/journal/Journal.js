import React, { useState } from 'react';
import Page from './Page';
import LegalPadPage from './LegalPadPage';
import Cover from './Cover';

const Journal = ({ style = 'legal-pad' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const renderPage = () => {
    switch(style) {
      case 'legal-pad':
        return <LegalPadPage pageNumber={currentPage + 1} />;
      default:
        return <Page style={style} pageNumber={currentPage + 1} />;
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {!isOpen ? (
        <Cover 
          style={style} 
          onOpen={() => setIsOpen(true)}
        />
      ) : (
        <div className="relative flex justify-center">
          {renderPage()}
        </div>
      )}
    </div>
  );
};

export default Journal;