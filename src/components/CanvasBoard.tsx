import React, { useRef, useEffect, useState } from 'react';
import { Stage } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';
import { useEditorStore } from '../store';
import { GridLayer } from './GridLayer';
import { StitchLayer } from './StitchLayer';

const CELL_SIZE = 20;

export const CanvasBoard: React.FC = () => {
    const {
        scale,
        position,
        selectedColor,
        setPixel,
        setZoom,
        setPan
    } = useEditorStore();

    const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    //const isDragging = useRef(false);
    const isPainting = useRef(false);

    useEffect(() => {
        const handleResize = () => {
            setSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        const stage = e.target.getStage();
        if (!stage) return;

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const scaleBy = 1.1;
        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

        setZoom(newScale);

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };

        setPan(newPos.x, newPos.y);
    };

    const getGridPos = (pointer: Vector2d, stageX: number, stageY: number, stageScale: number) => {
        return {
            x: Math.floor((pointer.x - stageX) / stageScale / CELL_SIZE),
            y: Math.floor((pointer.y - stageY) / stageScale / CELL_SIZE),
        };
    };

    const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
        // Middle click (button 1) or spacebar+drag (handled via draggable)
        // If button 0 (left), we paint
        if (e.evt.button === 0) {
            isPainting.current = true;
            const stage = e.target.getStage();
            if (!stage) return;

            const pointer = stage.getPointerPosition();
            if (pointer) {
                const { x, y } = getGridPos(pointer, position.x, position.y, scale);
                setPixel(x, y, selectedColor);
            }
        }
    };

    const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
        if (isPainting.current) {
            const stage = e.target.getStage();
            if (!stage) return;

            const pointer = stage.getPointerPosition();
            if (pointer) {
                const { x, y } = getGridPos(pointer, position.x, position.y, scale);
                setPixel(x, y, selectedColor);
            }
        }
    };

    const handleMouseUp = () => {
        isPainting.current = false;
    };

    // Draggable logic for panning (middle click)
    // Konva has native 'draggable' prop, but we want to control it via store 'position'
    // However, updating store on every drag move is expensive for React re-renders if we re-render the WHOLE stage.
    // But since position is binding to Stage props, it's okay.
    // We can use onDragEnd to sync, or onDragMove.
    // Requirement: "Implement Draggable logic".

    return (
        <Stage
            width={size.width}
            height={size.height}
            scaleX={scale}
            scaleY={scale}
            x={position.x}
            y={position.y}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDragEnd={(e) => {
                setPan(e.target.x(), e.target.y());
            }}
        >
            <GridLayer width={size.width} height={size.height} />
            <StitchLayer />
        </Stage>
    );
};
