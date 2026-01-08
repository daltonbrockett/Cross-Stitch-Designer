
export interface StitchLogicInput {
    design_shape: 'square' | 'circle';
    dimensions: { width: number; height: number } | { radius: number }; // stitches
    fabric_count: number; // stitches per inch
    strand_count: number; // strands per stitch
    palette_counts: Record<string, number>; // DMC_CODE -> stitch_count
}

export interface MaterialRequirement {
    dmc_code: string;
    stitch_count: number;
    estimated_meters: number;
    skeins_to_buy: number;
}

export interface StitchLogicOutput {
    project_summary: {
        design_area_inches: string;
        design_area_cm: string;
        suggested_fabric_cut_inches: string;
        fabric_type: string;
    };
    materials: MaterialRequirement[];
    total_skeins: number;
}

// Consumption per stitch in cm (includes waste buffer)
const CONSUMPTION_RATES: Record<number, number> = {
    11: 3.5,
    14: 2.9,
    16: 2.5,
    18: 2.2,
    22: 1.8
};

// Standard constants
const MARGIN_INCHES_PER_SIDE = 3;
const SKEIN_LENGTH_METERS = 8.0;
const STANDARD_SKEIN_STRANDS = 6;

export const calculateMaterials = (input: StitchLogicInput): StitchLogicOutput => {
    const { design_shape, dimensions, fabric_count, strand_count, palette_counts } = input;

    // 1. Calculate Design Area (Inches & CM)
    let widthStitches = 0;
    let heightStitches = 0;

    if ('radius' in dimensions) {
        // Circle: treat width/height as diameter (radius * 2) for fabric cutting
        widthStitches = dimensions.radius * 2;
        heightStitches = dimensions.radius * 2;
    } else {
        widthStitches = dimensions.width;
        heightStitches = dimensions.height;
    }

    const widthInches = widthStitches / fabric_count;
    const heightInches = heightStitches / fabric_count;

    const widthCm = widthInches * 2.54;
    const heightCm = heightInches * 2.54;

    // 2. Calculate Fabric Cut (with margins)
    // +3 inches on EACH side = +6 inches total
    const marginTotal = MARGIN_INCHES_PER_SIDE * 2;
    const cutWidth = widthInches + marginTotal;
    const cutHeight = heightInches + marginTotal;

    // 3. Thread Consumption Logic
    // Fallback for unknown fabric counts? Use closest or default? 
    // Spec only lists 11, 14, 16, 18, 22. 
    // We'll try to find exact match or warn/default. 
    // If not found, estimating based on linear interpolation or just default to 14ct (2.9) is safest?
    // Let's perform a simple lookup or default to the highest consumption (11ct) to be safe.
    let baseConsumption = CONSUMPTION_RATES[fabric_count];
    if (!baseConsumption) {
        // Simple fallback logic: 
        // If count < 14, use 3.5. If > 18, use 1.8. In between, pick closest.
        // For strictness, let's default to 2.9 (14ct) if unknown, or maybe 3.5 to be safe.
        // Given spec "Ensure all standard errors lean towards overestimating", we use 3.5 (11ct) as safe fallback.
        baseConsumption = 3.5;
        // Or strictly check keys - but typically these are the options.
    }

    // Effective Yield per Skein (meters)
    // Formula: 8.0 * (6.0 / input_strand_count)
    // Example: 2 strands => 8 * (6/2) = 24 meters yielded
    const effectiveYield = SKEIN_LENGTH_METERS * (STANDARD_SKEIN_STRANDS / strand_count);

    const materials: MaterialRequirement[] = [];
    let totalSkeins = 0;

    for (const [dmc_code, count] of Object.entries(palette_counts)) {
        // Total Meters = (Stitch_Count * base_consumption_cm) / 100
        const totalMeters = (count * baseConsumption) / 100;

        // Skeins = Total_Meters / Effective_Yield (Round UP)
        const skeins = Math.ceil(totalMeters / effectiveYield);

        materials.push({
            dmc_code,
            stitch_count: count,
            estimated_meters: Number(totalMeters.toFixed(2)),
            skeins_to_buy: skeins
        });

        totalSkeins += skeins;
    }

    // Sort materials by color code or skein count? Spec doesn't say. 
    // Usually code ascending is nice.
    materials.sort((a, b) => a.dmc_code.localeCompare(b.dmc_code, undefined, { numeric: true }));

    const formatDim = (n: number) => n.toFixed(1); // One decimal place for neatness? Or 2? Spec format is "W x H"

    return {
        project_summary: {
            design_area_inches: `${formatDim(widthInches)}" x ${formatDim(heightInches)}"`,
            design_area_cm: `${formatDim(widthCm)}cm x ${formatDim(heightCm)}cm`,
            suggested_fabric_cut_inches: `${formatDim(cutWidth)}" x ${formatDim(cutHeight)}"`,
            fabric_type: `${fabric_count}-Count Aida`
        },
        materials,
        total_skeins: totalSkeins
    };
};
