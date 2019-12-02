import {
  NodeId,
} from "../enr";

type Topic = string;

export interface INode {
  id: NodeID;
}

export interface IServiceAd {
  topic: Topic;
}

export interface ILookupService {
  registerTopic(Topic): Promise<bool>;
  searchTopic(Topic): Promise<INode[]>;
  lookup(NodeID): Promise<INode[]>;
  updateLocalState(INode): Promise<Null>;
}

export interface IKadTable {
  readRandomNodes(): Promise<INode[]>;
  getRefreshTarget(): Promise<NodeID>;
  closest(NodeID, Number): Promise<INode[]>;
  add(INode): Promise<Null>;
}

export interface IAdService {
  handleAdPublish(IServiceAd)
}


export interface ITicketService {
  newTicket(): ITicket
  maybeAcceptTicket(ITicket): bool
}

export interface IAdTable {
  nextAvailableTime(Topic)
}
