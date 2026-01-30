export interface Node {
  id: string;
  addContact(contact: Contact): void;
  getClosestContacts(key: string, limit: number): Contact[];
}

export interface Contact {
  id: string;
  address: string;
  port: number;
}