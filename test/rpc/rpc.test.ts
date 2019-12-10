/* eslint-env mocha */
import {RPC, INetworkService, IMessage, newPingMessage, newPongMessage} from "../../src/dht";
import { expect } from "chai";
import { EventEmitter } from "events";

class TestNet extends EventEmitter implements INetworkService {
  public async sendMessages(msgs: IMessage[]): Promise<void> {
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
    let msg = [newPongMessage(ping)];
    net.sendMessages(msg);
  });
});
