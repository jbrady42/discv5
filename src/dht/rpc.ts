import {
  IDiscv5,
  IMessage,
  MessageType,
  INetworkService
} from "./types";

export class RPC {

  private network: INetworkService;

  public constructor(trans: INetworkService) {
    this.network = trans;
  }
  public async start(): Promise<void> {
    // Set up udp read loop

    // Set up session/ enc layer
    // session = setupSession(udpLayer);

    this.network.on("new-request", (e) => this.rpcRequest(e));
  }

  async rpcRequest(msg: IMessage): Promise<void> {
    let response = await this.handleMessage(msg);

    // Set request id to match
    for (let resp of response) {
      resp.requestId = msg.requestId;
    }
    // Send response
    await this.network.sendMessages(response)
  }

  async handleMessage(msg: IMessage): Promise<IMessage[]> {
    switch(msg.type) {
      case MessageType.PING: {
        return this.handlePing(msg);
      }
      case MessageType.FINDNODE: {
        return this.handleFindNode(msg);
      }
      case MessageType.REGTOPIC: {
        return this.handleRegTopic(msg);
      }
      case MessageType.TOPICQUERY: {
        return this.handleTopicQuery(msg);
      }
      default:
        return Promise.reject();
    }
  }

  async handlePing(msg: IMessage): Promise<IMessage[]> {
    return [newPongMessage(msg)];
  }

  async handleFindNode(msg: IMessage): Promise<IMessage[]> {
    return [newPongMessage(msg)];
  }

  async handleRegTopic(msg: IMessage): Promise<IMessage[]> {
    return [newPongMessage(msg)];
  }

  async handleTopicQuery(msg: IMessage): Promise<IMessage[]> {
    return [newPongMessage(msg)];
  }

}

export function newPongMessage(ping: IMessage): IMessage {
  return {
    type: MessageType.PONG,
    requestId: ping.requestId,
    data: Buffer.alloc(0)
  };
}

export function newPingMessage(): IMessage {
  return {
    type: MessageType.PING,
    requestId: requestId(),
    data: Buffer.alloc(0)
  };
}

export function requestId(): number {
  return 42;
}
