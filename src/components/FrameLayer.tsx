
import React, { useMemo } from 'react';
import { Layer, Path, Group, Circle, Rect } from 'react-konva';
import { useEditorStore } from '../store';

const CELL_SIZE = 20;
// Massive buffer to ensure the "wood" covers the visible screen even when zooming out
const HUGE = 50000;

export const FrameLayer: React.FC = () => {
    const { projectConfig } = useEditorStore();

    const shape = useMemo(() => {
        if (!projectConfig) return null;

        const { isCircular, aidaCount, width, height, radius } = projectConfig;

        // Calculate Pixel Dimensions
        const pixelWidth = !isCircular ? width * aidaCount * CELL_SIZE : 0;
        const pixelHeight = !isCircular ? height * aidaCount * CELL_SIZE : 0;
        const pixelRadius = isCircular ? radius * aidaCount * CELL_SIZE : 0;

        // Wood Color
        const woodColor = "#D2B48C"; // Tan
        const woodDark = "#8B4513"; // SaddleBrown/Darker wood for rim

        if (isCircular) {
            // Circular Embroidery Hoop
            // A Ring that acts as the physical hoop border
            // PLUS a massive outer area that is also tan
            const cx = pixelRadius;
            const cy = pixelRadius;

            // Simple Ring for the Hoop itself
            const hoopThickness = 20;

            const circlePath = `M ${cx} ${cy - pixelRadius} A ${pixelRadius} ${pixelRadius} 0 1 1 ${cx} ${cy + pixelRadius} A ${pixelRadius} ${pixelRadius} 0 1 1 ${cx} ${cy - pixelRadius}`;

            const outerPath = `M ${-HUGE} ${-HUGE} L ${HUGE} ${-HUGE} L ${HUGE} ${HUGE} L ${-HUGE} ${HUGE} Z`;

            return (
                <Group>
                    {/* The "Table" or "Outside" Mask */}
                    <Path
                        data={`${outerPath} ${circlePath}`}
                        fill={woodColor}
                        fillRule="evenodd"
                        listening={false}
                        opacity={0.3}
                        shadowColor="black"
                        shadowBlur={10}
                        shadowOpacity={0.2}
                    />
                    {/* The Hoop Rim */}
                    <Circle
                        x={cx}
                        y={cy}
                        radius={pixelRadius}
                        stroke={woodDark}
                        strokeWidth={hoopThickness}
                        shadowColor="black"
                        shadowBlur={5}
                        shadowOpacity={0.3}
                        listening={false}
                    />
                    {/* Screw Detail at top */}
                    <Rect
                        x={cx - 15}
                        y={cy - pixelRadius - 25}
                        width={30}
                        height={25}
                        fill="#C0C0C0" // Silver
                        cornerRadius={2}
                        stroke="#999"
                        strokeWidth={1}
                    />
                </Group>
            );

        } else {
            // Rectangular Frame
            // Path hole for rectangle

            const outerPath = `M ${-HUGE} ${-HUGE} L ${HUGE} ${-HUGE} L ${HUGE} ${HUGE} L ${-HUGE} ${HUGE} Z`;
            const innerRect = `M ${0} ${0} L ${pixelWidth} ${0} L ${pixelWidth} ${pixelHeight} L ${0} ${pixelHeight} Z`;

            const frameThickness = 20;

            return (
                <Group>
                    <Path
                        data={`${outerPath} ${innerRect}`}
                        fill={woodColor}
                        fillRule="evenodd"
                        listening={false}
                        opacity={0.3}
                    />
                    {/* Frame Border */}
                    <Rect
                        x={-frameThickness / 2}
                        y={-frameThickness / 2}
                        width={pixelWidth + frameThickness}
                        height={pixelHeight + frameThickness}
                        stroke={woodDark}
                        strokeWidth={frameThickness}
                        shadowColor="black"
                        shadowBlur={5}
                        shadowOpacity={0.3}
                        listening={false}
                    />
                </Group>
            );
        }

    }, [projectConfig]);

    if (!projectConfig) return null;

    return (
        <Layer>
            {shape}
        </Layer>
    );
};
