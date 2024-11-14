import React from 'react';

const Page = ({ style, pageNumber }) => {
  return (
    <div className="relative bg-white w-full aspect-[8.5/11] shadow-lg rounded">
      <div className="absolute inset-0 p-8">
        {/* Content will go here */}
        <div className="relative h-full">
          <textarea 
            className={`w-full h-full bg-transparent resize-none outline-none font-caveat text-xl`}
            placeholder="Start writing..."
          />
        </div>
      </div>
      <div className="absolute bottom-4 right-4 text-gray-400">
        {pageNumber}
      </div>
    </div>
  );
};

export default Page;