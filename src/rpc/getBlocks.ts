import { Block } from '../vm/Block';

// Placeholder data for now
const blocks: Block[] = [
  new Block(
    '0x1234567890abcdef',
    '0x0000000000000000',
    [
      {
        hash: '0x1234567890abcdef',
        from: '0x0123456789abcdef',
        to: '0xfedcba9876543210',
        value: 100,
        nonce: 1,
        signature: '0x1234567890abcdef1234567890abcdef'
      }
    ],
    1618926000,
    100,
    1
  ),
  new Block(
    '0x0987654321fedcba',
    '0x1234567890abcdef',
    [
      {
        hash: '0x0987654321fedcba',
        from: '0xfedcba9876543210',
        to: '0x0123456789abcdef',
        value: 50,
        nonce: 2,
        signature: '0x0987654321fedcba0987654321fedcba'
      }
    ],
    1618926060,
    100,
    2
  )
];

export async function getBlocks(limit: number, offset: number): Promise<Block[]> {
  // TODO: Implement logic to fetch blocks from the database
  return blocks.slice(offset, offset + limit);
}