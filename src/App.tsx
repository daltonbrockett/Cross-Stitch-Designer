import React from 'react';
import { CanvasBoard } from './components/CanvasBoard';
import { ColorPicker } from './components/ColorPicker';
import { findClosestDMC } from './utils/colorUtils';
import { useEditorStore } from './store';



function App() {
    const selectedColor = useEditorStore((state) => state.selectedColor);
    const setColor = useEditorStore((state) => state.setColor);
    const palette = useEditorStore((state) => state.palette);
    const addColor = useEditorStore((state) => state.addColor);
    const scale = useEditorStore((state) => state.scale);

    const [isPickerOpen, setIsPickerOpen] = React.useState(false);

    const dmcMatch = React.useMemo(() => findClosestDMC(selectedColor), [selectedColor]);


    return (
        <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
            {/* Sidebar */}
            <div className="w-16 flex flex-col items-center py-4 bg-white shadow-md z-10 border-r border-gray-200 relative">
                <div className="mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Palette</div>

                <div className="flex flex-col gap-2 overflow-y-auto w-full items-center py-2 max-h-[calc(100vh-150px)] scrollbar-hide">
                    {palette.map((color) => (
                        <button
                            key={color}
                            className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 flex-shrink-0
                                        ${selectedColor === color ? 'border-gray-800 scale-110 shadow-lg' : 'border-gray-200'
                                }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setColor(color)}
                            title={color}
                        />
                    ))}

                    <button
                        className={`w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors flex-shrink-0
                            ${isPickerOpen ? 'bg-gray-100 border-gray-400 text-gray-600' : ''}`}
                        onClick={() => setIsPickerOpen(!isPickerOpen)}
                        title="Add Color"
                    >
                        <span className="text-xl leading-none mb-0.5">+</span>
                    </button>
                </div>

                {isPickerOpen && (
                    <ColorPicker
                        onClose={() => setIsPickerOpen(false)}
                        onAdd={(color) => {
                            addColor(color);
                            setIsPickerOpen(false);
                        }}
                        style={{ top: 150 }}
                    />
                )}

                <div className="mt-auto px-2 text-center text-[10px] text-gray-400 pt-4">
                    Zoom: {Math.round(scale * 100)}%
                </div>
                <div className="mt-2 text-[10px] text-gray-400 text-center">
                    MiddleClick to Pan
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 relative">
                <CanvasBoard />

                {/* Selected Color Info Panel */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-200 z-10 flex items-center gap-3 pointer-events-none select-none transition-all">
                    <div
                        className="w-12 h-12 rounded-lg border-2 border-white shadow-md"
                        style={{ backgroundColor: selectedColor }}
                    />
                    <div className="flex flex-col min-w-[140px]">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Selected Color</div>
                        <div className="font-mono font-bold text-gray-800 text-lg leading-none mb-1">{selectedColor}</div>
                        {dmcMatch && (
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 text-xs text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded w-fit mt-0.5">
                                    <span>DMC {dmcMatch.floss}</span>
                                </div>
                                <div className="text-[10px] text-gray-500 font-medium truncate max-w-[150px] mt-0.5">
                                    {dmcMatch.description}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
