import {
  NodeId,
} from "../enr";
import {MessageBox} from "../message";
import { EventEmitter } from "events";

type Topic = string;

export interface INode {
  id: NodeId;
}

export interface IServiceAd {
  topic: Topic;
}

export interface IDiscv5 {
  registerTopic(t: Topic): Promise<boolean>;
  searchTopic(t: Topic): Promise<INode[]>;
  lookup(id: NodeId): Promise<INode[]>;
  updateLocalState(node: INode): Promise<null>;
}

export interface INetworkService extends EventEmitter {
  sendMessages(msgs: MessageBox[]): Promise<void>;
}

export interface IKadTable {
  readRandomNodes(): Promise<INode[]>;
  getRefreshTarget(): Promise<NodeId>;
  closest(id: NodeId, num: number): Promise<INode[]>;
  add(node: INode): Promise<void>;
}
