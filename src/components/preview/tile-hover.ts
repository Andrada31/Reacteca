import { createContext, useContext, useState, type FocusEvent, type PointerEvent } from 'react';

/** Whether the library tile around a thumbnail is hovered or keyboard-focused, so its scene plays. */
export const TileHoverContext = createContext(false);

export function useTileHovered(): boolean {
  return useContext(TileHoverContext);
}

/**
 * Tracks a tile's hover (mouse and pen, not touch) and keyboard focus. Spread `handlers` on the tile and
 * provide `active` to its thumbnail through TileHoverContext.
 */
export function useTileHover() {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return {
    active: hovered || focused,
    handlers: {
      onPointerEnter: (event: PointerEvent) => {
        if (event.pointerType !== 'touch') setHovered(true);
      },
      onPointerLeave: () => setHovered(false),
      // Keyboard focus only: a click focuses the link too, and the pointer is already hovering.
      onFocus: (event: FocusEvent) => setFocused(event.target.matches(':focus-visible')),
      onBlur: () => setFocused(false),
    },
  };
}
