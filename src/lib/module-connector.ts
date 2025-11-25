/**
 * Module Connector System
 * Connects and synchronizes data between different modules/processes
 */

import { ProcessConfig, getProcessById } from "./processes-config";
import { processFactory, ProcessInstance } from "./process-factory";

export interface ModuleConnection {
  sourceProcessId: string;
  targetProcessId: string;
  connectionType: "data" | "reference" | "sync";
  mapping: Record<string, string>; // field mapping
  bidirectional?: boolean;
}

export interface ConnectionRule {
  id: string;
  name: string;
  description: string;
  sourceProcess: string;
  targetProcess: string;
  transform?: (data: any) => any;
  autoSync?: boolean;
}

class ModuleConnector {
  private connections: Map<string, ModuleConnection> = new Map();
  private rules: ConnectionRule[] = [];

  /**
   * Register a connection between two processes
   */
  registerConnection(connection: ModuleConnection): void {
    const key = `${connection.sourceProcessId}-${connection.targetProcessId}`;
    this.connections.set(key, connection);
  }

  /**
   * Add a transformation rule
   */
  addRule(rule: ConnectionRule): void {
    this.rules.push(rule);
  }

  /**
   * Sync data from source to target
   */
  async syncData(
    sourceInstanceId: string,
    targetProcessId: string,
    ruleId?: string
  ): Promise<ProcessInstance | null> {
    const sourceInstance = await processFactory.load(sourceInstanceId);
    if (!sourceInstance) return null;

    const connection = this.findConnection(sourceInstance.processId, targetProcessId);
    if (!connection) return null;

    const rule = ruleId 
      ? this.rules.find(r => r.id === ruleId)
      : this.rules.find(r => 
          r.sourceProcess === sourceInstance.processId && 
          r.targetProcess === targetProcessId
        );

    let transformedData = sourceInstance.data;
    
    if (rule?.transform) {
      transformedData = rule.transform(sourceInstance.data);
    } else {
      // Default mapping
      transformedData = this.mapFields(sourceInstance.data, connection.mapping);
    }

    // Create or update target instance
    const targetInstances = await processFactory.list(targetProcessId);
    const existing = targetInstances.find(
      inst => inst.metadata?.notes?.includes(sourceInstanceId)
    );

    if (existing) {
      existing.data = { ...existing.data, ...transformedData };
      existing.updatedAt = new Date();
      await processFactory.save(existing);
      return existing;
    } else {
      const newInstance = await processFactory.create(targetProcessId, transformedData);
      if (newInstance.metadata) {
        newInstance.metadata.notes = `Synced from ${sourceInstanceId}`;
      }
      await processFactory.save(newInstance);
      return newInstance;
    }
  }

  /**
   * Find connection between two processes
   */
  private findConnection(sourceId: string, targetId: string): ModuleConnection | null {
    const key = `${sourceId}-${targetId}`;
    return this.connections.get(key) || null;
  }

  /**
   * Map fields according to connection mapping
   */
  private mapFields(data: any, mapping: Record<string, string>): any {
    const mapped: any = {};
    for (const [sourceKey, targetKey] of Object.entries(mapping)) {
      if (data[sourceKey] !== undefined) {
        mapped[targetKey] = data[sourceKey];
      }
    }
    return mapped;
  }

  /**
   * Get all connections for a process
   */
  getConnections(processId: string): ModuleConnection[] {
    return Array.from(this.connections.values()).filter(
      conn => conn.sourceProcessId === processId || conn.targetProcessId === processId
    );
  }

  /**
   * Get available target processes for a source
   */
  getAvailableTargets(sourceProcessId: string): ProcessConfig[] {
    const connections = this.getConnections(sourceProcessId);
    return connections
      .map(conn => {
        const targetId = conn.targetProcessId === sourceProcessId 
          ? conn.sourceProcessId 
          : conn.targetProcessId;
        return getProcessById(targetId);
      })
      .filter((p): p is ProcessConfig => p !== undefined);
  }
}

// Pre-configured connections
const connector = new ModuleConnector();

// Example: Connect Music to Event
connector.registerConnection({
  sourceProcessId: "music",
  targetProcessId: "event",
  connectionType: "data",
  mapping: {
    "songInfo.title": "overview.eventName",
    "songInfo.artist": "lineup.artists[0].name",
  },
  bidirectional: false,
});

// Example: Connect Event to Tour
connector.registerConnection({
  sourceProcessId: "event",
  targetProcessId: "tour",
  connectionType: "reference",
  mapping: {
    "overview.venue": "venues[0].name",
    "overview.date": "dates[0].date",
  },
});

// Example transformation rule
connector.addRule({
  id: "music-to-event",
  name: "Music to Event",
  description: "Transform music project into event planning",
  sourceProcess: "music",
  targetProcess: "event",
  transform: (data) => {
    return {
      overview: {
        eventName: data.songInfo?.title || "New Event",
        eventType: "concerto",
        date: "",
        venue: "",
        capacity: 0,
        description: `Event for ${data.songInfo?.title || "song"}`,
        organizerName: "",
        organizerContact: "",
      },
      lineup: {
        artists: data.songInfo?.artist ? [{
          name: data.songInfo.artist,
          time: "",
          fee: 0,
          contact: "",
          instagram: "",
          spotify: "",
        }] : [],
        soundcheck: "",
        curfew: "",
      },
    };
  },
  autoSync: false,
});

export { connector as moduleConnector };

