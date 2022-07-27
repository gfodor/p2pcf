declare module "p2pt" {
  import type { EventEmitter } from "events";
  export default class P2PT<SendableMessage = any> extends EventEmitter {
    _peerId: string;
    constructor(announceURLs: Array<string> = [], identifierString = "");
    setIdentifier(identifierString: string): void;
    start(): void;
    requestMorePeers(): Promise<object>;
    send(
      peer: Peer,
      msg: SendableMessage,
      msgID: number = ""
    ): Promise<[peer: Peer, msg: object]>;
    addTracker(announceURL: string): void;
    removeTracker(announceURL: string): void;
    requestMorePeers(): void;
    getTrackerStats(): TrackerStats;
    destroy(): void;

    on(event: "peerconnect", callback: (peer: Peer) => void);
    on(event: "data", callback: (peer: Peer, data: any) => void);
    on(event: "msg", callback: (peer: Peer, msg: any) => void);
    on(event: "peerclose", callback: (peer: Peer) => void);
    on(
      event: "trackerconnect",
      callback: (tracker: Tracker, stats: TrackerStats) => void
    );
    on(
      event: "trackerwarning",
      callback: (error: object, stats: TrackerStats) => void
    );
  }
  export interface Peer {
    id: string;
    respond(msg: SendableMessage): Promise<[peer: Peer, msg: any]>;
  }
  export interface Tracker {
    announceUrl: string;
  }
  export interface TrackerStats {
    connected: number;
    total: number;
  }
}
