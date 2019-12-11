/* eslint-env mocha */
import {PacketType, TAG_LENGTH, AUTH_TAG_LENGTH, MAGIC_LENGTH} from "../../src/packet";
import {UDPTransportService} from "../../src/transport";
import { expect } from "chai";

import {RPC, newPingMessage, newPongMessage} from "../../src/dht";
import { EventEmitter } from "events";
import {MessageBox, MessageType} from "../../src/message";
import {SessionService} from "../../src/session";
import {IKeypair, KeypairType} from "../../src/keypair";
import { ENR, v4 } from "../../src/enr";

function newKeypair(): IKeypair {
  return {type: KeypairType.rsa, privateKey: Buffer.alloc(0), publicKey: Buffer.alloc(0)};
}


describe("E2E", () => {

  const address = "127.0.0.1";
  const magicA = Buffer.alloc(MAGIC_LENGTH, 1);
  const portA = 49523;
  const a = new UDPTransportService({port: portA, address}, magicA);

  const magicB = Buffer.alloc(MAGIC_LENGTH, 2);
  const portB = portA + 1;
  const b = new UDPTransportService({port: portB, address}, magicB);


  // Setup ENR

  let seq = 1n;
  let privateKey = Buffer.from("b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291", "hex");
  let record = ENR.createV4(v4.publicKey(privateKey));
  record.set("ip", Buffer.from("7f000001", "hex"));
  record.set("udp", Buffer.from((30303).toString(16), "hex"));
  record.seq = seq;


  const netA = new SessionService(record, newKeypair(), a);
  const rpcA = new RPC(netA);

  const netB = new SessionService(record, newKeypair(), b);
  const rpcB = new RPC(netB);


  before(async () => {
    await rpcA.start()
    await rpcB.start()
  });

  after(async () => {
    await rpcA.close()
    await rpcB.close()
  });


  it("should respond to real packets pong message to ping", async () => {
    rpcA.sendPingSock({address, port: portB});
  });
});
