import {MessageBox} from "../message"
import { EventEmitter } from "events";
import {ISocketAddr} from "../transport";


export enum SessionState {
  /**
   * A WHOAREYOU packet has been sent, and the Session is awaiting an Authentication response.
   */
  WhoAreYouSent,
  /**
   * A RANDOM packet has been sent and the Session is awaiting a WHOAREYOU response.
   */
  RandomSent,
  /**
   * An AuthMessage has been sent with a new set of generated keys. Once a response has been
   * received that we can decrypt, the session transitions to an established state, replacing
   * any current set of keys. No Session is currently active.
   */
  AwaitingResponse,
  /**
   * An established Session has received a WHOAREYOU. In this state, messages are sent
   * out with the established sessions keys and new encrypted messages are first attempted to
   * be decrypted with the established session keys, upon failure, the new keys are tried. If
   * the new keys are successful, the session keys are updated and the state progresses to
   * `Established`
   */
  EstablishedAwaitingResponse,
  /**
   * A Session has been established and the ENR IP matches the source IP.
   */
  Established,
  /**
   * Processing has failed. Fatal error.
   */
  Poisoned,
}


export interface ISessionService extends EventEmitter {
  // Send message using the established session
  sendResponse(msg: MessageBox): Promise<void>;
  // Send message directly to socket, kicks off new session establishment
  sendMessageSock(addr: ISocketAddr, msg: MessageBox): Promise<void>;

  start(): Promise<void>
  close(): Promise<void>
}

export interface IKeys {
  authRespKey: Buffer;
  encryptionKey: Buffer;
  decryptionKey: Buffer;
}

/**
 * Wrapper interface for Session state
 * We maintain 0, 1, or 2 keys depending on the state
 */
export type ISessionState =
  {state: SessionState.WhoAreYouSent} |
  {state: SessionState.RandomSent} |
  {state: SessionState.Poisoned} |
  {state: SessionState.AwaitingResponse; currentKeys: IKeys} |
  {state: SessionState.Established; currentKeys: IKeys} |
  {state: SessionState.EstablishedAwaitingResponse; currentKeys: IKeys; newKeys: IKeys};

export enum TrustedState {
  /**
   * The ENR socket address matches what is observed
   */
  Trusted,
  /**
   * The source socket address of the last message doesn't match the known ENR.
   * In this state, the service will respond to requests, but does not treat the node as
   * connected until the IP is updated to match the source IP.
   */
  Untrusted,
}
