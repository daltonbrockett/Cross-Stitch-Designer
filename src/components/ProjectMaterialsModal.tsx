
import React, { useMemo } from 'react';
import { useEditorStore } from '../store';
import { calculateMaterials, StitchLogicInput } from '../utils/stitchLogic';
import { findClosestDMC } from '../utils/colorUtils';

interface ProjectMaterialsModalProps {
    onClose: () => void;
}

export const ProjectMaterialsModal: React.FC<ProjectMaterialsModalProps> = ({ onClose }) => {
    const { pattern, projectConfig } = useEditorStore();

    const calculations = useMemo(() => {
        if (!projectConfig) return null;

        // Aggregate palette usage
        const palette_counts: Record<string, number> = {};
        Object.values(pattern).forEach((hex) => {
            const dmc = findClosestDMC(hex);
            const code = dmc ? dmc.floss : 'Unknown';
            palette_counts[code] = (palette_counts[code] || 0) + 1;
        });

        // Prepare input for StitchLogic
        const input: StitchLogicInput = {
            design_shape: projectConfig.isCircular ? 'circle' : 'square',
            dimensions: projectConfig.isCircular
                ? { radius: projectConfig.radius * projectConfig.aidaCount }
                : { width: projectConfig.width * projectConfig.aidaCount, height: projectConfig.height * projectConfig.aidaCount },
            fabric_count: projectConfig.aidaCount,
            strand_count: projectConfig.strands,
            palette_counts
        };
        return calculateMaterials(input);
    }, [pattern, projectConfig]);

    if (!projectConfig || !calculations) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Project Materials</h2>
                        <div className="text-sm text-gray-500 mt-1">
                            {calculations.project_summary.fabric_type} • {calculations.project_summary.design_area_inches} Design Area
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Fabric Section */}
                    <div className="bg-blue-50 rounded-lg p-5 mb-8 border border-blue-100">
                        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-3">Fabric Requirements</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="text-sm text-blue-600 mb-1">Suggested Fabric Cut (+3" margin)</div>
                                <div className="text-2xl font-mono font-bold text-blue-900">
                                    {calculations.project_summary.suggested_fabric_cut_inches}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-blue-600 mb-1">Design Area</div>
                                <div className="text-lg font-mono font-semibold text-blue-800">
                                    {calculations.project_summary.design_area_cm}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thread Table */}
                    <div>
                        <div className="flex justify-between items-end mb-4">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                                Thread Consumption ({projectConfig.strands} strands)
                            </h3>
                            <div className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                                Total Skeins: {calculations.total_skeins}
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">DMC Code</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Stitches</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Req. Meters <span className="normal-case font-normal text-gray-400">(inc. waste)</span>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Skeins</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {calculations.materials.map((mat) => (
                                        <tr key={mat.dmc_code} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className="text-sm font-bold text-gray-900">#{mat.dmc_code}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600 font-mono">
                                                {mat.stitch_count.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600 font-mono font-medium">
                                                {mat.estimated_meters.toFixed(2)}m
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                    ${mat.skeins_to_buy > 1 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                                    {mat.skeins_to_buy}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {calculations.materials.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500 italic">
                                                No stitches drawn yet. Start painting to see material requirements.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
