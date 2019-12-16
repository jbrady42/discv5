/* eslint-env mocha */
import {PacketType, TAG_LENGTH, AUTH_TAG_LENGTH, MAGIC_LENGTH} from "../../src/packet";
import {UDPTransportService} from "../../src/transport";

import {RPC} from "../../src/dht";
import {SessionService} from "../../src/session";
import {IKeypair, KeypairType, generateKeypair} from "../../src/keypair";
import { ENR, v4 } from "../../src/enr";


describe("E2E", () => {

  const address = "127.0.0.1";
  const magicA = Buffer.alloc(MAGIC_LENGTH, 1);
  const portA = 49523;
  const a = new UDPTransportService({port: portA, address}, magicA);

  const magicB = Buffer.alloc(MAGIC_LENGTH, 2);
  const portB = portA + 1;
  const b = new UDPTransportService({port: portB, address}, magicB);


  // Setup ENR

  let key1 = generateKeypair(KeypairType.secp256k1);
  let key2 = generateKeypair(KeypairType.secp256k1);

  let record1 = ENR.createV4(v4.publicKey(key1.privateKey));
  record1.set("ip", Buffer.from("7f000001", "hex"));
  record1.set("udp", Buffer.from((30303).toString(16), "hex"));
  record1.seq = 1n;

  let record2 = ENR.createV4(v4.publicKey(key2.privateKey));
  record2.set("ip", Buffer.from("7f000001", "hex"));
  record2.set("udp", Buffer.from((30304).toString(16), "hex"));
  record2.seq = 2n;


  const netA = new SessionService(record1, key1, a);
  const rpcA = new RPC(netA);

  const netB = new SessionService(record2, key2, b);
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
