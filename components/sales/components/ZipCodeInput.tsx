import React, { useState, useRef } from 'react';

interface ZipCodeInputProps {
  zipCodes: string[];
  setZipCodes: React.Dispatch<React.SetStateAction<string[]>>;
}

const ZipCodeInput: React.FC<ZipCodeInputProps> = ({ zipCodes, setZipCodes }) => {
  const [currentZipCode, setCurrentZipCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData('text');
    
    // Split by commas, newlines, or spaces and filter out empty strings
    const newZipCodes = pastedText
      .split(/[\s,\n]+/)
      .map(zip => zip.trim())
      .filter(zip => zip.length > 0);

    // Add the new unique zip codes
    setZipCodes(prevZipCodes => {
      const combinedZipCodes = [...new Set([...prevZipCodes, ...newZipCodes])];
      return combinedZipCodes;
    });

    setCurrentZipCode('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === ',') {
      event.preventDefault();
      if (currentZipCode.trim()) {
        setZipCodes(prevZipCodes => {
          if (!prevZipCodes.includes(currentZipCode.trim())) {
            return [...prevZipCodes, currentZipCode.trim()];
          }
          return prevZipCodes;
        });
        setCurrentZipCode('');
      }
    } else if (event.key === 'Backspace' && !currentZipCode && zipCodes.length > 0) {
      const newZipCodes = [...zipCodes];
      newZipCodes.pop();
      setZipCodes(newZipCodes);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Check if the input contains any delimiters
    if (value.includes(',') || value.includes('\n')) {
      // Split and process multiple zip codes
      const newZipCodes = value
        .split(/[\s,\n]+/)
        .map(zip => zip.trim())
        .filter(zip => zip.length > 0);

      setZipCodes(prevZipCodes => {
        const combinedZipCodes = [...new Set([...prevZipCodes, ...newZipCodes])];
        return combinedZipCodes;
      });
      setCurrentZipCode('');
    } else {
      setCurrentZipCode(value);
    }
  };

  const removeZipCode = (index: number) => {
    const newZipCodes = zipCodes.filter((_, i) => i !== index);
    setZipCodes(newZipCodes);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center px-3 py-2 w-full rounded-md border border-input bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        {zipCodes.map((zip, index) => (
          <span
            key={index}
            className="bg-secondary text-secondary-foreground rounded-full px-2 py-1 text-xs m-1 flex items-center"
          >
            {zip}
            <button
              type="button"
              onClick={() => removeZipCode(index)}
              className="ml-1 text-secondary-foreground hover:text-primary focus:outline-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          className="flex-grow outline-none bg-transparent text-sm"
          placeholder={zipCodes.length === 0 ? "Add Zip Codes (paste or type and press Enter)" : ""}
          value={currentZipCode}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Tip: You can paste multiple zip codes separated by commas, spaces, or new lines
      </div>
    </div>
  );
};

export default ZipCodeInput;