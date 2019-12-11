import {
  MessageType,
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
    await this.network.start();
    this.network.on("on-request", this.rpcRequest);
    this.network.on("on-response", this.rpcResponse);
  }

  public async close(): Promise<void> {
    this.network.removeListener("on-request", this.rpcRequest);
    this.network.removeListener("on-response", this.rpcResponse);
    await this.network.close();
  }

  public rpcResponse = async (msg: MessageBox): Promise<void> => {
    console.log("Got response", msg)
  }

  public rpcRequest = async (msg: MessageBox): Promise<void> => {
    let response = await this.handleMessage(msg);
    this.network.sendResponse(response);
  }

  async handleMessage(msg: MessageBox): Promise<MessageBox> {
    console.log("Handle message ", msg);
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

  async sendPingSock(addr: ISocketAddr) {
    let msg = newPingMessage();
    this.network.sendMessageSock(addr, msg);
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
