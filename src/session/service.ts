import { EventEmitter } from "events";
import { ITransportService, ISocketAddr } from "../transport";
import { PacketType, Packet, IWhoAreYouPacket, IAuthMessagePacket, IMessagePacket, createMessagePacket } from "../packet";
import { NodeId, ENR } from "../enr";
import { Session } from "./session";
import { IKeypair } from "../keypair";
import {MessageBox, MessageType, encode, decode, isRequest, isResponse} from "../message"
import {Tag} from "../packet";
import xor = require("buffer-xor");
import sha256 = require("bcrypto/lib/sha256");
import { ISessionService } from "./types";


/**
 * Session management for the Discv5 Discovery service.
 *
 * The `SessionService` is responsible for establishing and maintaining sessions with
 * connected/discovered nodes. Each node, identified by it's [`NodeId`] is associated with a
 * [`Session`]. This service drives the handshakes for establishing the sessions and associated
 * logic for sending/requesting initial connections/ENR's from unknown peers.
 *
 * The `SessionService` also manages the timeouts for each request and reports back RPC failures,
 * session timeouts and received messages. Messages are encrypted and decrypted using the
 * associated `Session` for each node.
 *
 * An ongoing connection is managed by the `Session` struct. A node that provides and ENR with an
 * IP address/port that doesn't match the source, is considered untrusted. Once the IP is updated
 * to match the source, the `Session` is promoted to an established state. RPC requests are not sent
 * to untrusted Sessions, only responses.
 */
export class SessionService extends EventEmitter implements ISessionService {
  private enr: ENR;
  private keypair: IKeypair;
  private transport: ITransportService;
  private sessions: Map<NodeId, Session>;
  constructor(enr: ENR, keypair: IKeypair, transport: ITransportService) {
    super();
    this.enr = enr;
    this.keypair = keypair;
    this.transport = transport;
    this.sessions = new Map<NodeId, Session>();
  }
  public async start(): Promise<void> {
    // @ts-ignore
    this.transport.on("packet", this.onPacket);
    await this.transport.start();
  }
  public async close(): Promise<void> {
    // @ts-ignore
    this.transport.removeListener("packet", this.onPacket);
    await this.transport.close();
  }
  public onWhoAreYou(from: ISocketAddr, packet: IWhoAreYouPacket): void {
  }
  public onAuthMessage(from: ISocketAddr, packet: IAuthMessagePacket): void {
  }
  public onMessage(fromId: NodeId, from: ISocketAddr, packet: IMessagePacket): void {
    console.log("On message", packet)
    //Find session
    let sess = this.sessions.get(fromId);

    // Is this a new session?
    if (!sess) {
      // Trigger WHOAREYOU
      console.log("No session found");
      this.sendWhoAreYou(from, fromId, packet.authTag);
      return;
    }


    // Handle sess establishment

    // Decrypt packet
    let buf = Buffer.alloc(0);
    try {
      let buf = sess.decryptMessage(packet.authTag, packet.message, packet.tag);
    } catch(err) {
      console.log("Decode failed");
      return;
    }

    // Process packet
    let [msgType, msg] = decode(buf);
    let nodeId = Buffer.alloc(32);
    let msgBox = {
      nodeId,
      msgType,
      msg,
      cxInfo: from,
    }



    // New request
    if(isRequest(msgType)) {
      this.emit("on-request", msgBox)
    } else if(isResponse(msgType)) {
      //Response
      this.emit("on-response", msgBox)
    }
  }
  public onPacket = (from: ISocketAddr, type: PacketType, packet: Packet): void => {
    // console.log("On message", packet)
    switch (type) {
      case PacketType.WhoAreYou:
        return this.onWhoAreYou(from, packet as IWhoAreYouPacket);
      case PacketType.AuthMessage:
        return this.onAuthMessage(from, packet as IAuthMessagePacket);
      case PacketType.Message:
        let src = this.srcId((packet as IMessagePacket).tag);
        return this.onMessage(src, from, packet as IMessagePacket);
    }
  };

  public async sendRequest(msg: MessageBox): Promise<void> {

  }

  public async sendResponse(msg: MessageBox): Promise<void> {
    // Find session
    // Encrypt data
    // Send
    let data = encode(msg.msgType, msg.msg);
    this.transport.send(msg.cxInfo, PacketType.Message, createMessagePacket(this.enr.nodeId, msg.nodeId, data));
    console.log("Send response", msg);
  }
  public async sendMessageSock(addr: ISocketAddr, msg: MessageBox): Promise<void> {
    // Find session
    // Encrypt data
    // Send
    let data = encode(msg.msgType, msg.msg);
    this.transport.send(addr, PacketType.Message, createMessagePacket(this.enr.nodeId, msg.nodeId, data));
    console.log("Send message to sock");
  }

  srcId(tag: Tag): NodeId {
    return xor(sha256.digest(this.enr.nodeId), tag);
  }

   async sendWhoAreYou(src: ISocketAddr, srcId: NodeId, tag: Buffer): Promise<void> {
     console.log("Send who are you packet");
     // If session established or packet already send
     // No need to send another packet


     let [session, packet] = Session.createWithWhoAreYou(srcId, 0n, null, tag);

     this.sessions.set(srcId, session);

     this.transport.send(src, PacketType.WhoAreYou, packet);


   }
}
