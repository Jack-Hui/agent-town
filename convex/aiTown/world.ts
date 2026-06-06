import { ObjectType, v } from 'convex/values';
import { Conversation, serializedConversation } from './conversation';
import { Player, serializedPlayer } from './player';
import { Agent, serializedAgent } from './agent';
import { House, serializedHouse } from '../ours/lib/house';  // EXEMPT: house system extension
import { GameTime, serializedTime } from '../ours/lib/time';  // EXEMPT: time system extension
import { GameId, parseGameId, playerId } from './ids';
import { parseMap } from '../util/object';

export const historicalLocations = v.array(
  v.object({
    playerId,
    location: v.bytes(),
  }),
);

export const serializedWorld = {
  nextId: v.number(),
  conversations: v.array(v.object(serializedConversation)),
  players: v.array(v.object(serializedPlayer)),
  agents: v.array(v.object(serializedAgent)),
  houses: v.optional(v.array(v.object(serializedHouse))),  // EXEMPT: house system extension
  time: v.optional(v.object(serializedTime)),  // EXEMPT: time system extension
  historicalLocations: v.optional(historicalLocations),
};
export type SerializedWorld = ObjectType<typeof serializedWorld>;

export class World {
  nextId: number;
  conversations: Map<GameId<'conversations'>, Conversation>;
  players: Map<GameId<'players'>, Player>;
  agents: Map<GameId<'agents'>, Agent>;
  houses: Map<GameId<'houses'>, House>;  // EXEMPT: house system extension
  time: GameTime;  // EXEMPT: time system extension
  historicalLocations?: Map<GameId<'players'>, ArrayBuffer>;

  constructor(serialized: SerializedWorld) {
    const { nextId, historicalLocations } = serialized;

    this.nextId = nextId;
    this.conversations = parseMap(serialized.conversations, Conversation, (c) => c.id);
    this.players = parseMap(serialized.players, Player, (p) => p.id);
    this.agents = parseMap(serialized.agents, Agent, (a) => a.id);
    this.houses = serialized.houses  // EXEMPT: house system extension
      ? parseMap(serialized.houses, House, (h) => h.id)
      : new Map();
    this.time = serialized.time  // EXEMPT: time system extension
      ? new GameTime(serialized.time)
      : GameTime.createInitial(Date.now());

    if (historicalLocations) {
      this.historicalLocations = new Map();
      for (const { playerId, location } of historicalLocations) {
        this.historicalLocations.set(parseGameId('players', playerId), location);
      }
    }
  }

  playerConversation(player: Player): Conversation | undefined {
    return [...this.conversations.values()].find((c) => c.participants.has(player.id));
  }

  // EXEMPT: house system - Get the house owned by an agent
  getAgentHouse(agentId: GameId<'agents'>): House | undefined {
    return [...this.houses.values()].find((h) => h.ownerAgentId === agentId);
  }

  // EXEMPT: house system - Get all unassigned houses
  getUnassignedHouses(): House[] {
    return [...this.houses.values()].filter((h) => !h.ownerAgentId);
  }

  // EXEMPT: house system - Assign a house to an agent
  assignHouse(agentId: GameId<'agents'>, houseId: GameId<'houses'>): boolean {
    const house = this.houses.get(houseId);
    if (!house) return false;

    // Check if house is already owned
    if (house.ownerAgentId && house.ownerAgentId !== agentId) return false;

    // Remove agent from previous house
    for (const h of this.houses.values()) {
      if (h.ownerAgentId === agentId) {
        h.ownerAgentId = undefined;
      }
    }

    house.assignOwner(agentId);
    return true;
  }

  serialize(): SerializedWorld {
    return {
      nextId: this.nextId,
      conversations: [...this.conversations.values()].map((c) => c.serialize()),
      players: [...this.players.values()].map((p) => p.serialize()),
      agents: [...this.agents.values()].map((a) => a.serialize()),
      houses: [...this.houses.values()].map((h) => h.serialize()),  // EXEMPT: house system extension
      time: this.time.serialize(),  // EXEMPT: time system extension
      historicalLocations:
        this.historicalLocations &&
        [...this.historicalLocations.entries()].map(([playerId, location]) => ({
          playerId,
          location,
        })),
    };
  }
}
