import RLP = require("rlp");
import {
  IAuthHeader,
  IAuthMessagePacket,
  IMessagePacket,
  IRandomPacket,
  IWhoAreYouPacket,
  Packet,
  PacketType,
} from "./types";

export function encode(type: PacketType, packet: Packet): Buffer {
  switch (type) {
    case PacketType.Random:
      return encodeRandomPacket(packet as IRandomPacket);
    case PacketType.WhoAreYou:
      return encodeWhoAreYouPacket(packet as IWhoAreYouPacket);
    case PacketType.AuthMessage:
      return encodeAuthMessagePacket(packet as IAuthMessagePacket);
    case PacketType.Message:
      return encodeMessagePacket(packet as IMessagePacket);
  }
}

export function encodeAuthHeader(h: IAuthHeader): Buffer {
  return RLP.encode([
    h.authTag,
    h.authSchemeName,
    h.ephemeralPubkey,
    h.authResponse,
  ]);
}

function encodeRandomPacket(p: IRandomPacket): Buffer {
  return Buffer.concat([
    p.tag,
    RLP.encode(p.authTag),
    p.randomData,
  ]);
}

function encodeWhoAreYouPacket(p: IWhoAreYouPacket): Buffer {
  return Buffer.concat([
    p.tag,
    p.magic,
    RLP.encode([
      p.token,
      p.idNonce,
      Buffer.from(p.enrSeq.toString(16).padStart(8 * 2, "0").slice(0, 8 * 2), "hex"),
    ]),
  ]);
}

function encodeAuthMessagePacket(p: IAuthMessagePacket): Buffer {
  return Buffer.concat([
    p.tag,
    encodeAuthHeader(p.authHeader),
    p.message,
  ]);
}

function encodeMessagePacket(p: IMessagePacket): Buffer {
  return Buffer.concat([
    p.tag,
    RLP.encode(p.authTag),
    p.message,
  ]);
}
