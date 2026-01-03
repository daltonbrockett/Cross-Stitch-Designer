import React from 'react';
import { CanvasBoard } from './components/CanvasBoard';
import { ColorPicker } from './components/ColorPicker';
import { useEditorStore } from './store';



function App() {
    const selectedColor = useEditorStore((state) => state.selectedColor);
    const setColor = useEditorStore((state) => state.setColor);
    const palette = useEditorStore((state) => state.palette);
    const addColor = useEditorStore((state) => state.addColor);
    const scale = useEditorStore((state) => state.scale);

    const [isPickerOpen, setIsPickerOpen] = React.useState(false);

    return (
        <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
            {/* Sidebar */}
            <div className="w-16 flex flex-col items-center py-4 bg-white shadow-md z-10 border-r border-gray-200 relative">
                <div className="mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Palette</div>

                <div className="flex flex-col gap-2 overflow-y-auto w-full items-center pb-2 max-h-[calc(100vh-150px)] scrollbar-hide">
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
            <div className="flex-1 relaitve">
                <CanvasBoard />
            </div>
        </div>
    );
}

export default App;
