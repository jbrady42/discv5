/* eslint-env mocha */
import {RPC, newPingMessage, newPongMessage} from "../../src/dht";
import { expect } from "chai";
import { EventEmitter } from "events";
import {MessageBox, MessageType} from "../../src/message";
import {ISessionService} from "../../src/session";

class TestNet extends EventEmitter implements ISessionService {
  public async sendResponse(msgs: MessageBox): Promise<void> {
    // let msg = msgs[0];
    // let remote = this.sessions[msg.nodeId]
    // this.sendLower(msg, remote);
    console.log(msgs);
  }
  public async sendMessageSock(msgs: MessageBox): Promise<void> {
    // let msg = msgs[0];
    // let remote = this.sessions[msg.nodeId]
    // this.sendLower(msg, remote);
    console.log(msgs);
  }
}

describe("RPC", () => {

  const net = new TestNet();
  const rpc = new RPC(net);
  rpc.start()

  it("should respond with pong message to ping", async () => {
    let ping = newPingMessage()
    net.emit("new-request", ping);
  });
});
