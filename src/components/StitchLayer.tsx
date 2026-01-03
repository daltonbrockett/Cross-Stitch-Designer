import React from 'react';
import { Layer, Rect } from 'react-konva';
import { useEditorStore } from '../store';

const CELL_SIZE = 20;

export const StitchLayer: React.FC = () => {
    const pattern = useEditorStore((state) => state.pattern);

    return (
        <Layer>
            {Object.entries(pattern).map(([key, color]) => {
                const [x, y] = key.split(',').map(Number);

                return (
                    <Rect
                        key={key}
                        x={x * CELL_SIZE}
                        y={y * CELL_SIZE}
                        width={CELL_SIZE}
                        height={CELL_SIZE}
                        fill={color}
                        listening={false} // Optim: stitches don't need events, the stage handles clicks
                    />
                );
            })}
        </Layer>
    );
};
