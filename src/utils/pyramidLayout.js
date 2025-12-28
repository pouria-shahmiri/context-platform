/**
 * Constants for the pyramid layout
 */
export const BLOCK_SIZE = 80; // Width/Height of the block visual
export const SPACING_X = 113;  // Horizontal step (approx 80 * sqrt(2))
export const SPACING_Y = 113;  // Vertical step

/**
 * Calculates the visual (x, y) coordinates for a block in the 45-degree rotated grid.
 * 
 * @param {number} u - The coordinate along the bottom-left axis.
 * @param {number} v - The coordinate along the bottom-right axis.
 * @returns {Object} { x, y } - The visual coordinates (relative to the tip).
 */
export const calculateCoordinates = (u, v) => {
  // x = (v - u) * (SPACING_X / 2)
  // y = (u + v) * (SPACING_Y / 2)
  // 
  // Example:
  // (0,0) -> 0, 0
  // (1,0) -> -40, 40 (Left-down)
  // (0,1) -> 40, 40 (Right-down)
  // (1,1) -> 0, 80 (Directly below tip)
  
  return {
    x: (v - u) * (SPACING_X / 2),
    y: (u + v) * (SPACING_Y / 2)
  };
};

/**
 * Generates a standard block ID from u and v coordinates.
 * @param {number} u 
 * @param {number} v 
 * @returns {string} The block ID (e.g., "0-0")
 */
export const generateBlockId = (u, v) => {
  return `${u}-${v}`;
};

/**
 * Parses a block ID back to u and v coordinates.
 * @param {string} id 
 * @returns {Object} { u, v }
 */
export const parseBlockId = (id) => {
  const [u, v] = id.split('-').map(Number);
  return { u, v };
};

/**
 * Creates a new Block object with default values.
 * @param {number} u 
 * @param {number} v 
 * @param {string} type 
 * @returns {Object} The new block object
 */
export const createBlock = (u, v, type = 'question') => {
  // Calculate potential parents (above) and children (below) based on grid logic
  // Note: This assumes a standard pyramid structure.
  // "Parents" usually refers to the nodes this node depends on (below it?) or nodes that created it (above it?).
  // In a standard "Pyramid Solver" (math), the value of a block is derived from the two blocks below it.
  // So "Children" (dependencies) are (u+1, v) and (u, v+1).
  // "Parents" (dependents) are (u-1, v) and (u, v-1).
  
  // Let's store the IDs.
  const childIds = [
      generateBlockId(u + 1, v),
      generateBlockId(u, v + 1)
  ];
  
  const parentIds = [];
  if (u > 0) parentIds.push(generateBlockId(u - 1, v));
  if (v > 0) parentIds.push(generateBlockId(u, v - 1));

  return {
    id: generateBlockId(u, v),
    u,
    v,
    type,
    content: '',
    parentIds,
    childIds
    // Calculated visual position can be derived on the fly
  };
};

/**
 * Helper to get row index from u, v
 * Row index is simply the sum of u and v (Manhattan distance from tip)
 */
export const getRowIndex = (u, v) => u + v;
