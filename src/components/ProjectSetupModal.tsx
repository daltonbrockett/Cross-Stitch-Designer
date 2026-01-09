
import React, { useState } from 'react';
import { useEditorStore } from '../store';

export const ProjectSetupModal: React.FC = () => {
    const setProjectConfig = useEditorStore((state) => state.setProjectConfig);
    const loadProject = useEditorStore((state) => state.loadProject);

    const [aidaCount, setAidaCount] = useState<11 | 14 | 16 | 18>(14);
    const [isCircular, setIsCircular] = useState(false);
    const [width, setWidth] = useState(5);
    const [height, setHeight] = useState(7);
    const [radius, setRadius] = useState(6);
    const [strands, setStrands] = useState<1 | 2 | 3 | 6>(3);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProjectConfig({
            aidaCount,
            isCircular,
            width,
            height,
            radius,
            strands
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Cross Stitch Designer
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Aida Count */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Aida Count (ct)
                        </label>
                        <select
                            value={aidaCount}
                            onChange={(e) => setAidaCount(Number(e.target.value) as any)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                        >
                            <option value={11}>11 count</option>
                            <option value={14}>14 count (Recommended)</option>
                            <option value={16}>16 count</option>
                            <option value={18}>18 count</option>
                        </select>
                    </div>

                    {/* Shape Selection */}
                    <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center h-5">
                            <input
                                id="isCircular"
                                type="checkbox"
                                checked={isCircular}
                                onChange={(e) => setIsCircular(e.target.checked)}
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                        </div>
                        <label htmlFor="isCircular" className="font-medium text-gray-700 cursor-pointer select-none">
                            Circular Design?
                        </label>
                    </div>

                    {/* Dimensions Group */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Circular: Radius */}
                        <div className={`col-span-2 transition-opacity duration-200 ${!isCircular ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Radius (inches)
                            </label>
                            <input
                                type="number"
                                min="1"
                                step="0.5"
                                value={radius}
                                onChange={(e) => setRadius(Number(e.target.value))}
                                disabled={!isCircular}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
                            />
                        </div>

                        {/* Rectangular: Width & Height */}
                        <div className={`transition-opacity duration-200 ${isCircular ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Width (inches)
                            </label>
                            <input
                                type="number"
                                min="1"
                                step="0.5"
                                value={width}
                                onChange={(e) => setWidth(Number(e.target.value))}
                                disabled={isCircular}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
                            />
                        </div>
                        <div className={`transition-opacity duration-200 ${isCircular ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Height (inches)
                            </label>
                            <input
                                type="number"
                                min="1"
                                step="0.5"
                                value={height}
                                onChange={(e) => setHeight(Number(e.target.value))}
                                disabled={isCircular}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
                            />
                        </div>
                    </div>

                    {/* DMC Strands */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            DMC Strands
                        </label>
                        <select
                            value={strands}
                            onChange={(e) => setStrands(Number(e.target.value) as any)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                        >
                            <option value={1}>1 strand</option>
                            <option value={2}>2 strands</option>
                            <option value={3}>3 strands</option>
                            <option value={6}>6 strands</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Create Project
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">start from file</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    <label className="flex items-center justify-center w-full bg-white border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 text-gray-500 font-bold py-3 px-4 rounded-lg cursor-pointer transition-all duration-200">
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Load Existing Project
                        </span>
                        <input
                            type="file"
                            accept=".json"
                            onChange={(e) => {
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
                            }}
                            className="hidden"
                        />
                    </label>
                </form>
            </div>
        </div>
    );
};
