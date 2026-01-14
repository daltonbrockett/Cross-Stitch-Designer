import React from 'react';
import { CanvasBoard } from './components/CanvasBoard';
import { ColorPicker } from './components/ColorPicker';
import { ProjectSetupModal } from './components/ProjectSetupModal';
import { ProjectMaterialsModal } from './components/ProjectMaterialsModal';
import { findClosestDMC } from './utils/colorUtils';
import { useEditorStore } from './store';



function App() {
    const projectConfig = useEditorStore((state) => state.projectConfig);
    const selectedColor = useEditorStore((state) => state.selectedColor);
    const setColor = useEditorStore((state) => state.setColor);
    const tool = useEditorStore((state) => state.tool);
    const setTool = useEditorStore((state) => state.setTool);
    const palette = useEditorStore((state) => state.palette);
    const addColor = useEditorStore((state) => state.addColor);
    const scale = useEditorStore((state) => state.scale);
    const loadProject = useEditorStore((state) => state.loadProject);
    const resetProject = useEditorStore((state) => state.resetProject);
    const clearPattern = useEditorStore((state) => state.clearPattern);

    const [isPickerOpen, setIsPickerOpen] = React.useState(false);
    const [isMaterialsOpen, setIsMaterialsOpen] = React.useState(false);

    const dmcMatch = React.useMemo(() => findClosestDMC(selectedColor), [selectedColor]);

    const handleNewProject = () => {
        if (window.confirm('Are you sure you want to start a new project? Any unsaved changes will be lost.')) {
            resetProject();
        }
    };

    const handleExport = () => {
        const filename = window.prompt('Enter a filename for your project:', 'cross-stitch-project');
        if (filename === null) return; // User cancelled

        const state = useEditorStore.getState();
        const data = {
            pattern: state.pattern,
            palette: state.palette,
            projectConfig: state.projectConfig
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (data.pattern && data.palette && data.projectConfig) {
                    loadProject(data);
                } else {
                    alert('Invalid project file');
                }
            } catch (err) {
                console.error(err);
                alert('Failed to parse project file');
            }
        };
        reader.readAsText(file);
        // Reset the input value so the same file can be selected again
        e.target.value = '';
    }

    if (!projectConfig) {
        return <ProjectSetupModal />;
    }

    return (
        <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
            {/* Sidebar */}
            <div className="w-16 flex flex-col items-center py-4 bg-white shadow-md z-10 border-r border-gray-200 relative">

                {/* Tools Section Top */}
                <div className="flex flex-col gap-4 mb-4">
                    <button
                        onClick={handleNewProject}
                        className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 flex items-center justify-center transition-all"
                        title="New Project"
                    >
                        {/* Plus Icon */}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>

                    <button
                        onClick={() => setIsMaterialsOpen(true)}
                        className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 flex items-center justify-center transition-all"
                        title="Project Materials"
                    >
                        {/* List/Clipboard Icon */}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </button>

                    <button
                        onClick={handleExport}
                        className="w-10 h-10 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 flex items-center justify-center transition-all"
                        title="Save Project"
                    >
                        {/* Save Icon */}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                    </button>

                    <label
                        className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 flex items-center justify-center transition-all cursor-pointer"
                        title="Load Project"
                    >
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="hidden"
                        />
                        {/* Load/Upload Icon */}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </label>

                    <div className="w-8 h-px bg-gray-200 mx-auto"></div>

                    <button
                        onClick={clearPattern}
                        className="w-10 h-10 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 flex items-center justify-center transition-all font-bold text-[10px]"
                        title="Clear Pattern"
                    >
                        CLEAR
                    </button>
                </div>

                <div className="flex flex-col gap-2 mb-4">
                    <button
                        onClick={() => setTool('brush')}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${tool === 'brush' ? 'bg-blue-100 text-blue-700 shadow-inner' : 'bg-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                        title="Brush"
                    >
                        {/* Brush Icon */}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setTool('eraser')}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${tool === 'eraser' ? 'bg-blue-100 text-blue-700 shadow-inner' : 'bg-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                        title="Eraser"
                    >
                        {/* Eraser Icon */}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                    <div className="w-8 h-px bg-gray-200 mx-auto mt-2"></div>
                </div>

                <div className="mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Palette</div>

                <div className="flex flex-col gap-2 overflow-y-auto w-full items-center py-2 max-h-[calc(100vh-250px)] scrollbar-hide">
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
                    Ctrl + Drag to Pan
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

                {/* Materials Modal */}
                {isMaterialsOpen && (
                    <ProjectMaterialsModal onClose={() => setIsMaterialsOpen(false)} />
                )}
            </div>
        </div>
    );
}

export default App;
