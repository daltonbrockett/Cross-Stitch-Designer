import React, { useMemo } from 'react';
import { Layer, Line } from 'react-konva';
import { useEditorStore } from '../store';

const CELL_SIZE = 20;

interface GridLayerProps {
    width: number;
    height: number;
}

export const GridLayer: React.FC<GridLayerProps> = ({ width, height }) => {
    const { position, scale } = useEditorStore();

    const lines = useMemo(() => {
        // Calculate visible area in grid coordinates
        const startX = Math.floor((-position.x) / scale / CELL_SIZE) - 1;
        const endX = Math.ceil((-position.x + width) / scale / CELL_SIZE) + 1;

        const startY = Math.floor((-position.y) / scale / CELL_SIZE) - 1;
        const endY = Math.ceil((-position.y + height) / scale / CELL_SIZE) + 1;

        const gridLines = [];

        // Vertical lines
        for (let i = startX; i <= endX; i++) {
            const isThick = i % 10 === 0;
            gridLines.push(
                <Line
                    key={`v${i}`}
                    points={[i * CELL_SIZE, startY * CELL_SIZE, i * CELL_SIZE, endY * CELL_SIZE]}
                    stroke="#ddd"
                    strokeWidth={isThick ? 2 : 1}
                    listening={false}
                />
            );
        }

        // Horizontal lines
        for (let j = startY; j <= endY; j++) {
            const isThick = j % 10 === 0;
            gridLines.push(
                <Line
                    key={`h${j}`}
                    points={[startX * CELL_SIZE, j * CELL_SIZE, endX * CELL_SIZE, j * CELL_SIZE]}
                    stroke="#ddd" // Light grey
                    strokeWidth={isThick ? 2 : 1}
                    listening={false}
                />
            );
        }

        return gridLines;
    }, [position.x, position.y, scale, width, height]);

    return (
        <Layer>
            {lines}
        </Layer>
    );
};
