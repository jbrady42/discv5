/* eslint-env mocha */
import {RPC, INetworkService, newPingMessage, newPongMessage} from "../../src/dht";
import { expect } from "chai";
import { EventEmitter } from "events";
import {MessageBox, MessageType} from "../../src/message";

class TestNet extends EventEmitter implements INetworkService {
  public async sendMessages(msgs: MessageBox[]): Promise<void> {
    let msg = msgs[0];
    let remote = this.sessions[msg.nodeId]
    this.sendLower(msg, remote);
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
