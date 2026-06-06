import { ObjectType, v } from 'convex/values';
import { GameId, parseGameId } from '../../aiTown/ids';
import { Point, point } from '../../util/types';

// House item/inventory entry
export const houseItem = v.object({
  itemId: v.string(),
  name: v.string(),
  description: v.string(),
  quantity: v.number(),
  addedAt: v.number(),
});
export type HouseItem = ObjectType<typeof houseItem>;

export const serializedHouse = {
  id: v.string(),
  // House position (top-left corner)
  x: v.number(),
  y: v.number(),
  width: v.number(),
  height: v.number(),
  // Door position for entry
  doorX: v.number(),
  doorY: v.number(),
  // Owner agent ID
  ownerAgentId: v.optional(v.string()),
  // House inventory/items
  inventory: v.optional(v.array(houseItem)),
  // House name/description
  name: v.optional(v.string()),
  description: v.optional(v.string()),
};
export type SerializedHouse = ObjectType<typeof serializedHouse>;

export class House {
  id: GameId<'houses'>;
  x: number;
  y: number;
  width: number;
  height: number;
  doorX: number;
  doorY: number;
  ownerAgentId?: GameId<'agents'>;
  inventory: HouseItem[];
  name?: string;
  description?: string;

  constructor(serialized: SerializedHouse) {
    this.id = parseGameId('houses', serialized.id);
    this.x = serialized.x;
    this.y = serialized.y;
    this.width = serialized.width;
    this.height = serialized.height;
    this.doorX = serialized.doorX;
    this.doorY = serialized.doorY;
    this.ownerAgentId = serialized.ownerAgentId
      ? parseGameId('agents', serialized.ownerAgentId)
      : undefined;
    this.inventory = serialized.inventory ?? [];
    this.name = serialized.name;
    this.description = serialized.description;
  }

  // Get the door position as a Point
  getDoorPosition(): Point {
    return { x: this.doorX, y: this.doorY };
  }

  // Check if a point is inside the house
  containsPoint(point: Point): boolean {
    return (
      point.x >= this.x &&
      point.x < this.x + this.width &&
      point.y >= this.y &&
      point.y < this.y + this.height
    );
  }

  // Check if a point is at the door
  isAtDoor(point: Point): boolean {
    return Math.floor(point.x) === this.doorX && Math.floor(point.y) === this.doorY;
  }

  // Add an item to the house inventory
  addItem(item: Omit<HouseItem, 'addedAt'>): void {
    const existingItem = this.inventory.find((i) => i.itemId === item.itemId);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.inventory.push({
        ...item,
        addedAt: Date.now(),
      });
    }
  }

  // Remove an item from the house inventory
  removeItem(itemId: string, quantity: number): boolean {
    const itemIndex = this.inventory.findIndex((i) => i.itemId === itemId);
    if (itemIndex === -1) return false;

    const item = this.inventory[itemIndex];
    if (item.quantity < quantity) return false;

    item.quantity -= quantity;
    if (item.quantity === 0) {
      this.inventory.splice(itemIndex, 1);
    }
    return true;
  }

  // Assign an owner to this house
  assignOwner(agentId: GameId<'agents'>): void {
    this.ownerAgentId = agentId;
  }

  serialize(): SerializedHouse {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      doorX: this.doorX,
      doorY: this.doorY,
      ownerAgentId: this.ownerAgentId,
      inventory: this.inventory,
      name: this.name,
      description: this.description,
    };
  }
}

// Pre-defined houses on the map (based on house4 in gentle.js)
// These positions should align with the actual map houses
export const DEFAULT_HOUSES: Omit<SerializedHouse, 'id' | 'ownerAgentId'>[] = [
  {
    x: 5,
    y: 5,
    width: 8,
    height: 8,
    doorX: 8,
    doorY: 12,
    name: 'Cozy Cottage',
    description: 'A small but comfortable home',
    inventory: [],
  },
  {
    x: 20,
    y: 5,
    width: 8,
    height: 8,
    doorX: 23,
    doorY: 12,
    name: 'Garden House',
    description: 'A house surrounded by flowers',
    inventory: [],
  },
  {
    x: 35,
    y: 5,
    width: 8,
    height: 8,
    doorX: 38,
    doorY: 12,
    name: 'Scholar Residence',
    description: 'Perfect for deep thinking',
    inventory: [],
  },
  {
    x: 50,
    y: 5,
    width: 8,
    height: 8,
    doorX: 53,
    doorY: 12,
    name: 'Quiet Retreat',
    description: 'Peace and solitude',
    inventory: [],
  },
  {
    x: 65,
    y: 5,
    width: 8,
    height: 8,
    doorX: 68,
    doorY: 12,
    name: 'Woodland Home',
    description: 'Close to nature',
    inventory: [],
  },
];
