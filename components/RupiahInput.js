import React from 'react';
import { formatNominal } from '../lib/formatters';

export default function RupiahInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
  required = false,
  disabled = false,
  name,
  id
}) {
  // Convert current value to formatted string (with dots)
  const displayValue = (value === '' || value === null || value === undefined)
    ? ''
    : (value === 0 || value === '0') ? '0' : formatNominal(value);

  const handleChange = (e) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    if (onChange) {
      onChange(rawVal);
    }
  };

  return (
    <div className="relative flex items-center w-full">
      <span className="absolute left-3.5 font-bold text-slate-400 text-xs pointer-events-none select-none">
        Rp
      </span>
      <input
        type="text"
        inputMode="numeric"
        id={id}
        name={name}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        className={`w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-bold text-slate-800 text-xs transition-colors ${className}`}
      />
    </div>
  );
}
