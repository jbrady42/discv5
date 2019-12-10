import {
  IDiscv5,
  INetworkService
} from "./types";
import {
  Message,
  MessageType,
  IPingMessage,
  IPongMessage,
  MessageBox
} from "../message";


export class RPC {

  private network: INetworkService;

  public constructor(trans: INetworkService) {
    this.network = trans;
  }
  public async start(): Promise<void> {
    // Set up udp read loop

    // Set up session/ enc layer
    // session = setupSession(udpLayer);

    this.network.on("new-request", (msg) => this.rpcRequest(msg));
  }

  async rpcRequest(msg: MessageBox): Promise<void> {
    let response = await this.handleMessage(msg);
    this.network.sendMessages(response)
  }

  async handleMessage(msg: MessageBox): Promise<MessageBox[]> {
    switch(msg.msgType) {
      case MessageType.PING: {
        return this.handlePing(msg);
      }
      // case MessageType.FINDNODE: {
      //   return this.handleFindNode(msg);
      // }
      // case MessageType.REGTOPIC: {
      //   return this.handleRegTopic(msg);
      // }
      // case MessageType.TOPICQUERY: {
      //   return this.handleTopicQuery(msg);
      // }
      default:
        return Promise.reject();
    }
  }

  async handlePing(msg: MessageBox): Promise<MessageBox[]> {
    return [newPongMessage(msg)] as MessageBox[];
  }

  // async handleFindNode(msg: Message): Promise<Message[]> {
  //   return [newPongMessage(msg)];
  // }
  //
  // async handleRegTopic(msg: Message): Promise<Message[]> {
  //   return [newPongMessage(msg)];
  // }
  //
  // async handleTopicQuery(msg: Message): Promise<Message[]> {
  //   return [newPongMessage(msg)];
  // }

}

export function newPongMessage(ping: MessageBox): MessageBox {
  let msg = ping.msg;
  let remoteInfo = ping.cxInfo
  return {
      msgType: MessageType.PONG,
      msg: {
        id: msg.id,
        enrSeq: 12n,
        recipientIp: remoteInfo.address,
        recipientPort: remoteInfo.port,
      },
      cxInfo: remoteInfo
  };
}

export function newPingMessage(): MessageBox {
  return {
    msgType: MessageType.PING,
    msg: {
      id: requestId(),
      enrSeq: 4n,
    },
    cxInfo: {port: 0, address: ""},
  };
}

export function requestId(): bigint {
  return 42n;
}
