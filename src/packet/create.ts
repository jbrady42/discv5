import { randomBytes } from "bcrypto/lib/random";
import sha256 = require("bcrypto/lib/sha256");
import xor = require("buffer-xor");

import { AUTH_TAG_LENGTH, TAG_LENGTH, ID_NONCE_LENGTH, RANDOM_DATA_LENGTH, WHOAREYOU_STRING } from "./constants";
import { IMessagePacket, Tag, AuthTag, IWhoAreYouPacket, IAuthResponse, Nonce, IAuthHeader } from "./types";
import { NodeId, SequenceNumber, ENR } from "../enr";

export function createRandomPacket(tag: Tag): IMessagePacket {
  return {
    tag,
    authTag: randomBytes(AUTH_TAG_LENGTH),
    message: randomBytes(RANDOM_DATA_LENGTH),
  };
}

export function createMagic(nodeId: NodeId): Buffer {
  return sha256.digest(Buffer.concat([nodeId, Buffer.from(WHOAREYOU_STRING)]));
}

export function createTag(srcNodeId: NodeId, destNodeId: NodeId): Tag {
  return xor(sha256.digest(destNodeId), srcNodeId);
}

export function createAuthTag(): AuthTag {
  return randomBytes(AUTH_TAG_LENGTH);
}

export function createMessagePacket(srcNodeId: NodeId, destNodeId: NodeId, data: Buffer): IMessagePacket {
  return {
    tag: createTag(srcNodeId, destNodeId),
    authTag: createAuthTag(),
    message: data,
  }
}

export function createWhoAreYouPacket(
  nodeId: NodeId,
  authTag: AuthTag,
  enrSeq: SequenceNumber
): IWhoAreYouPacket {
  return {
    magic: createMagic(nodeId),
    token: authTag,
    idNonce: randomBytes(ID_NONCE_LENGTH),
    enrSeq: Number(enrSeq),
  };
}

export function createAuthHeader(
  idNonce: Nonce,
  ephemeralPubkey: Buffer,
  authResponse: Buffer,
  authTag?: AuthTag
): IAuthHeader {
  return {
    authTag: authTag || createAuthTag(),
    idNonce,
    authSchemeName: "gcm",
    ephemeralPubkey,
    authResponse,
  };
}

export function createAuthResponse(signature: Buffer, enr?: ENR): IAuthResponse {
  return {
    version: 5,
    signature,
    nodeRecord: enr,
  };
}
