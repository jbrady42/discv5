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

    return new Promise<void>(res => {});
  }

  async rpcRequest(msg: IMessage): Promise<void> {
    let response = await this.handleMessage(msg);

    // Set request id to match
    for (let resp of response) {
      resp.requestId = msg.requestId;
    }
    // Send response
    await this.network.sendMessages(response)

    return new Promise<void>(res => {});
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
    return new Promise<IMessage[]>((res) => {
      // Make pong message
        res([newPongMessage()]);
    })
  }

  async handleFindNode(msg: IMessage): Promise<IMessage[]> {
    return new Promise<IMessage[]>(res => {
      // Make pong message
        res([newPongMessage()])
    })
  }

  async handleRegTopic(msg: IMessage): Promise<IMessage[]> {
    return new Promise<IMessage[]>(res => {
      // Make pong message
        res([newPongMessage()])
    })
  }

  async handleTopicQuery(msg: IMessage): Promise<IMessage[]> {
    return new Promise<IMessage[]>(res => {
      // Make pong message
        res([newPongMessage()])
    })
  }

}

export function newPongMessage(): IMessage {
  return {
    type: MessageType.PONG,
    requestId: 0,
    data: Buffer.alloc(0)
  };
}

export function newPingMessage(): IMessage {
  return {
    type: MessageType.PING,
    requestId: 0,
    data: Buffer.alloc(0)
  };
}
