import {
  NodeId,
} from "../enr";
import { EventEmitter } from "events";

type Topic = string;

export interface INode {
  id: NodeId;
}

export interface IServiceAd {
  topic: Topic;
}

export enum MessageType {
  PING = 1,
  PONG = 2,
  FINDNODE = 3,
  NODES = 4,
  REGTOPIC = 5,
  TICKET = 6,
  REGCONFIRM = 7,
  TOPICQUERY = 8,
}

export interface IMessage {
  type: MessageType;
  requestId: number;
  data: Buffer;
}

export interface IDiscv5 {
  registerTopic(t: Topic): Promise<boolean>;
  searchTopic(t: Topic): Promise<INode[]>;
  lookup(id: NodeId): Promise<INode[]>;
  updateLocalState(node: INode): Promise<null>;
}

export interface INetworkService extends EventEmitter {
  sendMessages(msgs: IMessage[]): Promise<void>;
}


export interface IKadTable {
  readRandomNodes(): Promise<INode[]>;
  getRefreshTarget(): Promise<NodeId>;
  closest(id: NodeId, num: number): Promise<INode[]>;
  add(node: INode): Promise<void>;
}
//
// export interface IAdService {
//   handleAdPublish(IServiceAd)
// }
//
//
// export interface ITicketService {
//   newTicket(): ITicket
//   maybeAcceptTicket(ITicket): bool
// }
//
// export interface IAdTable {
//   nextAvailableTime(Topic)
// }
