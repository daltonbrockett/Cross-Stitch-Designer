
import dmcColorsData from './dmcColors.json';

export interface DMCColor {
    floss: string;
    description: string;
    r: number;
    g: number;
    b: number;
    hex: string;
}

const dmcColors: DMCColor[] = dmcColorsData as DMCColor[];

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
    return Math.sqrt(
        Math.pow(r1 - r2, 2) +
        Math.pow(g1 - g2, 2) +
        Math.pow(b1 - b2, 2)
    );
}

export const findClosestDMC = (hex: string): DMCColor | null => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;

    let minDistance = Infinity;
    let closestColor: DMCColor | null = null;

    for (const dmc of dmcColors) {
        const dist = colorDistance(rgb.r, rgb.g, rgb.b, dmc.r, dmc.g, dmc.b);
        if (dist < minDistance) {
            minDistance = dist;
            closestColor = dmc;
        }
    }

    return closestColor;
};
