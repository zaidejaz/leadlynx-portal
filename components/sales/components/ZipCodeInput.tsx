import React, { useState, useRef } from 'react';

interface ZipCodeInputProps {
  zipCodes: string[];
  setZipCodes: React.Dispatch<React.SetStateAction<string[]>>;
}

const ZipCodeInput: React.FC<ZipCodeInputProps> = ({ zipCodes, setZipCodes }) => {
  const [currentZipCode, setCurrentZipCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === ' ' && currentZipCode.trim()) {
      setZipCodes([...zipCodes, currentZipCode.trim()]);
      setCurrentZipCode('');
      event.preventDefault();
    } else if (event.key === 'Backspace' && !currentZipCode && zipCodes.length > 0) {
      const newZipCodes = [...zipCodes];
      newZipCodes.pop();
      setZipCodes(newZipCodes);
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
          placeholder={zipCodes.length === 0 ? "Add Zip Codes (press space to add)" : ""}
          value={currentZipCode}
          onChange={(e) => setCurrentZipCode(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};

export default ZipCodeInput;