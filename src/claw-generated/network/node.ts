import { sha1 } from '../util';

export class Node {
  id: string;

  constructor(publicKey: string) {
    this.id = sha1(publicKey);
  }
}