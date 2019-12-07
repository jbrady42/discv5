/* eslint-env mocha */
import {RPC, INetworkService, IMessage, newPingMessage, newPongMessage} from "../../src/dht";
import { expect } from "chai";
import { EventEmitter } from "events";
import {mock, instance, verify} from "ts-mockito";

class TestNet extends EventEmitter implements INetworkService {
  public async sendMessages(msgs: IMessage[]): Promise<void> {
    console.log(msgs);
  }
}

describe("RPC", () => {

  // Creating mock
let mockedFoo:TestNet = mock(TestNet);

// Getting instance
let foo:TestNet = instance(mockedFoo);

  // const net = new TestNet();
  const rpc = new RPC(foo);
  rpc.start()

  it("should respond with pong message to ping", async () => {
    foo.emit("new-request", newPingMessage());
    let msg = [newPongMessage()];
    verify(foo.sendMessages(msg)).called();
  });
});
