

export const SCREEN_WIDTH = 800
export const SCREEN_HEIGHT = 600

export const TILE_WIDTH = 24
export const TILE_HEIGHT = 24
export const ROOM_TILE_WIDTH = 25
export const ROOM_TILE_HEIGHT = 25
export const ROOM_WIDTH = TILE_WIDTH * ROOM_TILE_WIDTH
export const ROOM_HEIGHT = TILE_HEIGHT * ROOM_TILE_HEIGHT

export const COLUMNS = 4
export const ROWS = 4

export const MAP_WIDTH = 180
export const MAP_HEIGHT = 180

export const MAP_ROOM_WIDTH = MAP_WIDTH/COLUMNS
export const MAP_ROOM_HEIGHT = MAP_WIDTH/COLUMNS

export const MAP_SPACER = ((SCREEN_WIDTH - ROOM_WIDTH - MAP_WIDTH)/2)