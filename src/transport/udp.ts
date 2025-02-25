import * as dgram from "dgram";
import { EventEmitter } from "events";

import {
  decode,
  encode,
  Packet,
  PacketType,
  MAX_PACKET_SIZE,
} from "../packet";
import {
  ISocketAddr,
  IRemoteInfo,
  ITransportService,
} from "./types";


/**
 * This class is responsible for encoding outgoing Packets and decoding incoming Packets over UDP
 */
export class UDPTransportService extends EventEmitter implements ITransportService {

  private socketAddr: ISocketAddr;
  private socket: dgram.Socket;
  private whoAreYouMagic: Buffer;

  public constructor(socketAddr: ISocketAddr, whoAreYouMagic: Buffer) {
    super();
    this.socketAddr = socketAddr;
    this.whoAreYouMagic = whoAreYouMagic;
    this.socket = dgram.createSocket({
      recvBufferSize: MAX_PACKET_SIZE,
      sendBufferSize: MAX_PACKET_SIZE,
      type: "udp4",
    });
  }

  public async start(): Promise<void> {
    this.socket.on("message", this.handleIncoming);
    return new Promise((resolve) => this.socket.bind(this.socketAddr.port, resolve));
  }

  public async close(): Promise<void> {
    this.socket.off("message", this.handleIncoming);
    return new Promise((resolve) => this.socket.close(resolve));
  }

  public async send(to: ISocketAddr, type: PacketType, packet: Packet): Promise<void> {
    return new Promise((resolve) => this.socket.send(encode(type, packet), to.port, to.address, () => resolve()));
  }

  public handleIncoming = (data: Buffer, rinfo: IRemoteInfo): void => {
    const sender = {
      address: rinfo.address,
      port: rinfo.port,
    };
    try {
      const [type, packet] = decode(data, this.whoAreYouMagic);
      this.emit("packet", sender, type, packet);
    } catch (e) {
      this.emit("error", e, sender);
    }
  };
}
