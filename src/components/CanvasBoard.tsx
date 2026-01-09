import React, { useRef, useEffect, useState } from 'react';
import { Stage } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';
import { useEditorStore } from '../store';
import { GridLayer } from './GridLayer';
import { StitchLayer } from './StitchLayer';
import { FrameLayer } from './FrameLayer';

const CELL_SIZE = 20;

export const CanvasBoard: React.FC = () => {
    const {
        scale,
        position,
        selectedColor,
        projectConfig,
        setPixel,
        removePixel,
        tool,
        setZoom,
        setPan,
        startStroke,
        endStroke,
        undo
    } = useEditorStore();

    const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [isCtrlPressed, setIsCtrlPressed] = useState(false);
    const isPainting = useRef(false);

    useEffect(() => {
        const handleResize = () => {
            setSize({ width: window.innerWidth, height: window.innerHeight });
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Control' || e.key === 'Meta') {
                setIsCtrlPressed(true);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                undo();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Control' || e.key === 'Meta') {
                setIsCtrlPressed(false);
            }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [undo]);

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

    const isWithinBounds = (x: number, y: number) => {
        if (!projectConfig) return true;

        const { isCircular, aidaCount, width, height, radius } = projectConfig;

        if (isCircular) {
            // Circle center in grid coords
            const r = radius * aidaCount;
            const cx = r;
            const cy = r;
            const distSq = (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2;
            return distSq <= r ** 2;
        } else {
            // Rectangle
            const w = width * aidaCount;
            const h = height * aidaCount;
            return x >= 0 && x < w && y >= 0 && y < h;
        }
    };

    const paintAt = (stage: any) => {
        const pointer = stage.getPointerPosition();
        if (pointer) {
            const { x, y } = getGridPos(pointer, position.x, position.y, scale);

            if (isWithinBounds(x, y)) {
                if (tool === 'eraser') {
                    removePixel(x, y);
                } else {
                    setPixel(x, y, selectedColor);
                }
            }
        }
    };

    const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
        // Middle click (button 1) or spacebar+drag (handled via draggable)
        // If button 0 (left), we paint
        if (e.evt.button === 0 && !isCtrlPressed) {
            isPainting.current = true;
            startStroke(); // Start recording history

            const stage = e.target.getStage();
            if (!stage) return;
            paintAt(stage);
        }
    };

    const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
        if (isPainting.current) {
            const stage = e.target.getStage();
            if (!stage) return;
            paintAt(stage);
        }
    };

    const handleMouseUp = () => {
        if (isPainting.current) {
            isPainting.current = false;
            endStroke(); // Commit history
        }
    };

    // Draggable logic for panning (middle click)

    return (
        <Stage
            width={size.width}
            height={size.height}
            scaleX={scale}
            scaleY={scale}
            x={position.x}
            y={position.y}
            draggable={isCtrlPressed}
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
            <FrameLayer />
        </Stage>
    );
};
