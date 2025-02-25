import assert = require("assert");
import keccak = require("bcrypto/lib/keccak");
import secp256k1 = require("bcrypto/lib/secp256k1");

import {
  NodeId,
  PrivateKey,
  PublicKey,
} from "./types";

export function hash(input: Buffer): Buffer {
  return keccak.digest(input);
}

export function createPrivateKey(): PrivateKey {
  return secp256k1.privateKeyGenerate();
}

export function publicKey(privKey: PrivateKey): PublicKey {
  return secp256k1.publicKeyCreate(privKey);
}

export function sign(privKey: PrivateKey, msg: Buffer): Buffer {
  return secp256k1.sign(
    hash(msg),
    privKey,
  );
}

export function verify(pubKey: PublicKey, msg: Buffer, sig: Buffer): boolean {
  return secp256k1.verify(hash(msg), sig, pubKey);
}

export function nodeId(pubKey: PublicKey): NodeId {
  return hash(secp256k1.publicKeyConvert(pubKey, false));
}

export class ENRKeyPair {
  public readonly nodeId: NodeId;
  public readonly privateKey: PrivateKey;
  public readonly publicKey: PublicKey;

  public constructor(privateKey?: PrivateKey) {
    if (privateKey) {
      assert(secp256k1.privateKeyVerify(privateKey));
    }
    this.privateKey = privateKey || createPrivateKey();
    this.publicKey = publicKey(this.privateKey);
    this.nodeId = nodeId(this.publicKey);
  }

  public sign(msg: Buffer): Buffer {
    return sign(this.privateKey, msg);
  }

  public verify(msg: Buffer, sig: Buffer): boolean {
    return verify(this.publicKey, msg, sig);
  }
}
