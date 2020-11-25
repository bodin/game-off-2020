

export const SCREEN_WIDTH = 800
export const SCREEN_HEIGHT = 600

export const TILE_WIDTH = 24
export const TILE_HEIGHT = 24
export const ROOM_TILE_WIDTH = 25
export const ROOM_TILE_HEIGHT = 25
export const ROOM_WIDTH = TILE_WIDTH * ROOM_TILE_WIDTH
export const ROOM_HEIGHT = TILE_HEIGHT * ROOM_TILE_HEIGHT

export const COLUMNS = 5
export const ROWS = 5

export const MAP_WIDTH = 180
export const MAP_HEIGHT = 180

export const MAP_ROOM_WIDTH = MAP_WIDTH/COLUMNS
export const MAP_ROOM_HEIGHT = MAP_WIDTH/COLUMNS

export const MAP_SPACER = ((SCREEN_WIDTH - ROOM_WIDTH - MAP_WIDTH)/2)

export const TOP = 0
export const LEFT = 1
export const RIGHT = 2
export const BOTTOM = 3

export const WALL = 0
export const DOOR = 1
export const UNKNOWN = -1

export const DOOR_PROBABILITY = 0.8
export const PILLARS = 5

export const SPEED_HERO_RUNNING = 510
export const SPEED_HERO_ROOM_SWITCH_NORMAL = 1000
export const SPEED_HERO_ROOM_SWITCH_CRAZY = 500
export const SPEED_PLAYER_WALKING = 300
export const SPEED_PLAYER_RUNNING = 500