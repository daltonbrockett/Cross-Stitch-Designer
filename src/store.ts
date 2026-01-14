import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Position {
    x: number
    y: number
}

export interface ProjectConfig {
    aidaCount: 11 | 14 | 16 | 18;
    isCircular: boolean;
    width: number; // inches
    height: number; // inches
    radius: number; // inches
    strands: 1 | 2 | 3 | 6;
}

interface EditorState {
    pattern: Record<string, string> // "x,y" -> hex color
    selectedColor: string
    palette: string[]
    tool: 'brush' | 'eraser'
    scale: number
    position: Position

    projectConfig: ProjectConfig | null

    // History
    undoStack: Array<Array<{ key: string, oldColor?: string, newColor: string }>>
    redoStack: Array<Array<{ key: string, oldColor?: string, newColor: string }>>
    currentStroke: Array<{ key: string, oldColor?: string, newColor: string }>

    // Actions
    setPixel: (x: number, y: number, color: string) => void
    removePixel: (x: number, y: number) => void
    clearPattern: () => void
    setZoom: (scale: number) => void
    setPan: (x: number, y: number) => void
    setColor: (color: string) => void
    setTool: (tool: 'brush' | 'eraser') => void
    addColor: (color: string) => void
    setProjectConfig: (config: ProjectConfig) => void

    // History Actions
    startStroke: () => void
    endStroke: () => void
    undo: () => void
    redo: () => void
    loadProject: (data: { pattern: Record<string, string>, palette: string[], projectConfig: ProjectConfig }) => void
    resetProject: () => void
}

export const useEditorStore = create<EditorState>()(
    persist(
        (set) => ({
            pattern: {}, // Sparse map
            palette: [
                '#FF0000', // Red
                '#00FF00', // Green
                '#0000FF', // Blue
                '#FFFF00', // Yellow
                '#000000', // Black
                '#FFFFFF', // White
                '#FFA500', // Orange
                '#800080', // Purple
            ],
            selectedColor: '#FF0000',
            tool: 'brush',
            scale: 1,
            position: { x: 0, y: 0 },

            projectConfig: null,

            undoStack: [],
            redoStack: [],
            currentStroke: [],

            setPixel: (x, y, color) => set((state) => {
                const key = `${x},${y}`;
                const oldColor = state.pattern[key];

                // Don't record if no change
                if (oldColor === color) return {};
                return {
                    pattern: { ...state.pattern, [key]: color },
                    currentStroke: [...state.currentStroke, { key, oldColor, newColor: color }]
                };
            }),

            clearPattern: () => set((state) => {
                if (Object.keys(state.pattern).length === 0) return {};

                if (!window.confirm('Are you sure you want to clear the pattern?')) {
                    return {};
                }

                const currentStroke = Object.entries(state.pattern).map(([key, oldColor]) => ({
                    key,
                    oldColor,
                    newColor: undefined as any
                }));

                return {
                    pattern: {},
                    undoStack: [...state.undoStack, currentStroke],
                    redoStack: [],
                    currentStroke: []
                };
            }),

            removePixel: (x, y) => set((state) => {
                const key = `${x},${y}`;
                const oldColor = state.pattern[key];
                if (oldColor === undefined) return {}; // Nothing to remove

                const newPattern = { ...state.pattern };
                delete newPattern[key];

                return {
                    pattern: newPattern,
                    currentStroke: [...state.currentStroke, { key, oldColor, newColor: undefined as any }] // undefined means delete
                };
            }),

            setZoom: (scale) => set({ scale }),

            setPan: (x, y) => set({ position: { x, y } }),

            setColor: (color) => set({ selectedColor: color }),
            setTool: (tool) => set({ tool }),

            addColor: (color) => set((state) => {
                if (state.palette.includes(color)) {
                    return { selectedColor: color };
                }
                return {
                    palette: [...state.palette, color],
                    selectedColor: color
                }
            }),

            setProjectConfig: (config) => set({ projectConfig: config }),

            loadProject: (data) => set({
                pattern: data.pattern,
                palette: data.palette,
                projectConfig: data.projectConfig,
                undoStack: [],
                redoStack: [],
                currentStroke: []
            }),

            resetProject: () => set({
                pattern: {},
                palette: [
                    '#FF0000', // Red
                    '#00FF00', // Green
                    '#0000FF', // Blue
                    '#FFFF00', // Yellow
                    '#000000', // Black
                    '#FFFFFF', // White
                    '#FFA500', // Orange
                    '#800080', // Purple
                ],
                selectedColor: '#FF0000',
                tool: 'brush',
                scale: 1,
                position: { x: 0, y: 0 },
                projectConfig: null,
                undoStack: [],
                redoStack: [],
                currentStroke: []
            }),

            startStroke: () => set({ currentStroke: [] }),

            endStroke: () => set((state) => {
                if (state.currentStroke.length === 0) return {};



                return {
                    undoStack: [...state.undoStack, state.currentStroke],
                    redoStack: [], // Clear redo on new action
                    currentStroke: []
                };
            }),

            undo: () => set((state) => {
                if (state.undoStack.length === 0) return {};

                const stroke = state.undoStack[state.undoStack.length - 1];
                const newUndoStack = state.undoStack.slice(0, -1);

                // Apply changes in reverse
                const newPattern = { ...state.pattern };
                const reversedStroke = [...stroke].reverse();

                reversedStroke.forEach(({ key, oldColor }) => {
                    if (oldColor === undefined) {
                        delete newPattern[key];
                    } else {
                        newPattern[key] = oldColor;
                    }
                });

                return {
                    pattern: newPattern,
                    undoStack: newUndoStack,
                    redoStack: [...state.redoStack, stroke]
                };
            }),

            redo: () => set((state) => {
                if (state.redoStack.length === 0) return {};

                const stroke = state.redoStack[state.redoStack.length - 1];
                const newRedoStack = state.redoStack.slice(0, -1);

                const newPattern = { ...state.pattern };

                stroke.forEach(({ key, newColor }) => {
                    if (newColor === undefined) {
                        delete newPattern[key];
                    } else {
                        newPattern[key] = newColor;
                    }
                });

                return {
                    pattern: newPattern,
                    undoStack: [...state.undoStack, stroke],
                    redoStack: newRedoStack
                };
            })
        }),
        {
            name: 'cross-stitch-storage',
            partialize: (state) => ({
                pattern: state.pattern,
                palette: state.palette,
                projectConfig: state.projectConfig,
            }),
        }
    )
)
