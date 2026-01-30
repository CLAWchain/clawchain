import { expect } from 'chai';
import { Chain } from '../chain';
import { Block } from '../block';

describe('Chain Reorganization', () => {
  it('should handle a simple chain reorganization', () => {
    // Arrange
    const chain = new Chain();
    const block1 = new Block(0, 'genesis');
    const block2a = new Block(1, 'chain A');
    const block2b = new Block(1, 'chain B');

    // Act
    chain.addBlock(block1);
    chain.addBlock(block2a);
    chain.addBlock(block2b);

    // Assert
    expect(chain.head).to.equal(block2b);
  });

  it('should handle a longer chain reorganization', () => {
    // Arrange
    const chain = new Chain();
    const block1 = new Block(0, 'genesis');
    const block2a = new Block(1, 'chain A');
    const block3a = new Block(2, 'chain A');
    const block2b = new Block(1, 'chain B');
    const block3b = new Block(2, 'chain B');
    const block4b = new Block(3, 'chain B');

    // Act
    chain.addBlock(block1);
    chain.addBlock(block2a);
    chain.addBlock(block3a);
    chain.addBlock(block2b);
    chain.addBlock(block3b);
    chain.addBlock(block4b);

    // Assert
    expect(chain.head).to.equal(block4b);
  });

  it('should handle a chain reorganization with different difficulties', () => {
    // Arrange
    const chain = new Chain();
    const block1 = new Block(0, 'genesis', 100);
    const block2a = new Block(1, 'chain A', 100);
    const block3a = new Block(2, 'chain A', 100);
    const block2b = new Block(1, 'chain B', 150);
    const block3b = new Block(2, 'chain B', 150);
    const block4b = new Block(3, 'chain B', 150);

    // Act
    chain.addBlock(block1);
    chain.addBlock(block2a);
    chain.addBlock(block3a);
    chain.addBlock(block2b);
    chain.addBlock(block3b);
    chain.addBlock(block4b);

    // Assert
    expect(chain.head).to.equal(block4b);
  });
});