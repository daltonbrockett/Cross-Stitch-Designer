import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
    onClose: () => void;
    onAdd: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ onClose, onAdd }) => {
    const [color, setColor] = useState('#aabbcc');

    const handleAdd = () => {
        onAdd(color);
        onClose();
    };

    return (
        <div className="absolute top-0 left-16 z-20 bg-white p-4 rounded-lg shadow-xl border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Add Custom Color</h3>

            <HexColorPicker color={color} onChange={setColor} />

            <div className="mt-4 flex gap-2">
                <div className="flex-1 flex items-center border border-gray-300 rounded px-2 bg-gray-50">
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
                        className="w-full bg-transparent outline-none text-sm text-gray-700 uppercase font-mono py-1"
                        maxLength={6}
                    />
                </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
                <button
                    onClick={onClose}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleAdd}
                    style={{ backgroundColor: color }}
                    className="px-3 py-1.5 text-xs text-white bg-blue-600 hover:opacity-90 rounded font-medium shadow-sm transition-opacity"
                // Determine text color based on background brightness (simple heuristic)
                >
                    Add Color
                </button>
            </div>
        </div>
    );
};
