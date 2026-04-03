/**
 * Linear Interpolation for numbers
 */
export function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * Basic Hex Color Lerp (Simplistic implementation)
 */
export function lerpColor(c1, c2, t) {
    const r1 = parseInt(c1.substring(1, 3), 16);
    const g1 = parseInt(c1.substring(3, 5), 16);
    const b1 = parseInt(c1.substring(5, 7), 16);

    const r2 = parseInt(c2.substring(1, 3), 16);
    const g2 = parseInt(c2.substring(3, 5), 16);
    const b2 = parseInt(c2.substring(5, 7), 16);

    const r = Math.round(startLerp(r1, r2, t));
    const g = Math.round(startLerp(g1, g2, t));
    const b = Math.round(startLerp(b1, b2, t));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function startLerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * Convert Hex to RGBA with specific alpha
 */
export function hexToRgba(hex, alpha) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
