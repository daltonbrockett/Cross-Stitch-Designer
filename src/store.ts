import { create } from 'zustand'

export interface Position {
    x: number
    y: number
}

interface EditorState {
    pattern: Record<string, string> // "x,y" -> hex color
    selectedColor: string
    palette: string[]
    scale: number
    position: Position

    // Actions
    setPixel: (x: number, y: number, color: string) => void
    removePixel: (x: number, y: number) => void
    setZoom: (scale: number) => void
    setPan: (x: number, y: number) => void
    setColor: (color: string) => void
    addColor: (color: string) => void
}

export const useEditorStore = create<EditorState>((set) => ({
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
    scale: 1,
    position: { x: 0, y: 0 },

    setPixel: (x, y, color) => set((state) => ({
        pattern: { ...state.pattern, [`${x},${y}`]: color }
    })),

    removePixel: (x, y) => set((state) => {
        const newPattern = { ...state.pattern }
        delete newPattern[`${x},${y}`]
        return { pattern: newPattern }
    }),

    setZoom: (scale) => set({ scale }),

    setPan: (x, y) => set({ position: { x, y } }),

    setColor: (color) => set({ selectedColor: color }),

    addColor: (color) => set((state) => {
        if (state.palette.includes(color)) {
            return { selectedColor: color };
        }
        return {
            palette: [...state.palette, color],
            selectedColor: color
        }
    }),
}))
