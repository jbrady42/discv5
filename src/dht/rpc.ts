import {
  IDiscv5,
} from "./types";
import {
  Message,
  MessageType,
  IPingMessage,
  IPongMessage,
  MessageBox
} from "../message";
import {ISessionService} from "../session";
import {ISocketAddr} from "../transport";


export class RPC {

  private network: ISessionService;

  public constructor(trans: ISessionService) {
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
    this.network.sendResponse(response);
  }

  async handleMessage(msg: MessageBox): Promise<MessageBox> {
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

  async handlePing(msg: MessageBox): Promise<MessageBox> {
    console.log("Handling ping");
    return newPongMessage(msg);
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

  async sendPing(addr: ISocketAddr) {
    let msg = newPingMessage();
    msg.cxInfo = addr;
    this.network.sendMessageSock(msg);
  }

}

export function newPongMessage(ping: MessageBox): MessageBox {
  let msg = ping.msg;
  let remoteInfo = ping.cxInfo;
  return {
      nodeId: ping.nodeId,
      msgType: MessageType.PONG,
      msg: {
        id: msg.id,
        enrSeq: 12n,
        recipientIp: remoteInfo.address,
        recipientPort: remoteInfo.port,
      },
      cxInfo: remoteInfo,
  };
}

export function newPingMessage(): MessageBox {
  return {
    nodeId: nodeId(),
    msgType: MessageType.PING,
    msg: {
      id: requestId(),
      enrSeq: 4n,
    },
    cxInfo: {port: 0, address: ""},
  };
}

export function nodeId(): Buffer {
  return Buffer.alloc(32);
}

export function requestId(): bigint {
  return 42n;
}
