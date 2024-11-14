import React from 'react';
import { journalDimensions, journalColors } from '../../styles/JournalStyles';

const LegalPadPage = ({ pageNumber }) => {
  const { legalPad: dims } = journalDimensions;
  const { legalPad: colors } = journalColors;

  // Calculate number of lines (with a safety maximum)
  const pixelsPerInch = 96; // standard browser DPI
  const pageHeightInPixels = parseFloat(dims.height) * pixelsPerInch;
  const lineSpacingInPixels = parseFloat(dims.lineSpacing) * pixelsPerInch;
  const headerHeightInPixels = parseFloat(dims.headerHeight);
  const linesCount = Math.min(
    Math.floor((pageHeightInPixels - headerHeightInPixels) / lineSpacingInPixels),
    50 // Maximum number of lines as a safety measure
  );

  return (
    <div 
      className="relative shadow-lg rounded-sm overflow-hidden"
      style={{
        width: dims.width,
        height: dims.height,
        backgroundColor: colors.paper,
      }}
    >
      {/* Header bar */}
      <div className="relative">
        <div 
          className="w-full"
          style={{ 
            height: dims.headerHeight,
            backgroundColor: colors.headerBar,
          }}
        >
          <div className="text-white px-4 py-1 font-marker text-sm opacity-90">
            the Legal Pad
          </div>
        </div>
      </div>

      {/* Content area with lines as background */}
      <div 
        className="relative h-full"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              ${colors.lines} 0px,
              ${colors.lines} 1px,
              transparent 1px,
              transparent ${dims.lineSpacing}
            )
          `,
          backgroundPositionY: dims.headerHeight,
          backgroundSize: `100% ${dims.lineSpacing}`,
        }}
      >
        {/* Margin line */}
        <div
          className="absolute top-0 bottom-0"
          style={{
            left: dims.marginLine,
            width: '1px',
            backgroundColor: colors.marginLine,
            opacity: 0.8
          }}
        />

        {/* Writing area */}
        <div 
          className="relative h-full"
          style={{ padding: dims.padding }}
        >
          <textarea
            className="w-full h-full bg-transparent resize-none outline-none font-reenie text-xl"
            style={{
              lineHeight: dims.lineSpacing,
              paddingLeft: `calc(${dims.marginLine} - 1rem)`,
              paddingTop: dims.headerHeight,
            }}
            placeholder="Start writing..."
          />
        </div>
      </div>

      {/* Page number */}
      <div className="absolute bottom-4 right-4 text-gray-600 opacity-50">
        {pageNumber}
      </div>
    </div>
  );
};

export default LegalPadPage;