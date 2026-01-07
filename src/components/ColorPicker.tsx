import React, { useState, useMemo } from 'react';
import { HexColorPicker } from 'react-colorful';
import { findClosestDMC } from '../utils/colorUtils';

interface ColorPickerProps {
    onClose: () => void;
    onAdd: (color: string) => void;
    style?: React.CSSProperties;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ onClose, onAdd, style }) => {
    const [color, setColor] = useState('#aabbcc');

    const closestDMC = useMemo(() => findClosestDMC(color), [color]);

    const handleAdd = () => {
        onAdd(color);
        onClose();
    };

    return (
        <div
            className="absolute left-16 z-20 bg-white p-4 rounded-lg shadow-xl border border-gray-200 w-64"
            style={{ top: 0, ...style }}
        >
            <h3 className="text-sm font-bold text-gray-700 mb-3">Add Custom Color</h3>

            <div className="flex justify-center mb-3">
                <HexColorPicker color={color} onChange={setColor} />
            </div>

            <div className="flex gap-2 mb-3">
                <div className="flex-1 flex items-center border border-gray-300 rounded px-2 bg-gray-50 h-8">
                    <span className="text-gray-500 text-sm select-none">#</span>
                    <input
                        type="text"
                        value={color.startsWith('#') ? color.slice(1) : color}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (/^[0-9A-Fa-f]*$/.test(val)) {
                                setColor('#' + val);
                            }
                        }}
                        className="w-full bg-transparent outline-none text-sm text-gray-700 uppercase font-mono"
                        maxLength={6}
                    />
                </div>
                <div
                    className="w-8 h-8 rounded border border-gray-300 shadow-inner"
                    style={{ backgroundColor: color }}
                />
            </div>

            {closestDMC && (
                <div className="mb-4 bg-blue-50 p-2 rounded border border-blue-100">
                    <div className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">
                        Closest DMC Floss
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-4 h-4 rounded-full shadow-sm border border-gray-200"
                            style={{ backgroundColor: `#${closestDMC.hex}` }}
                            title={`#${closestDMC.hex}`}
                        />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                                {closestDMC.description}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                                DMC {closestDMC.floss}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                    onClick={onClose}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleAdd}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm transition-colors"
                >
                    Add Color
                </button>
            </div>
        </div>
    );
};
