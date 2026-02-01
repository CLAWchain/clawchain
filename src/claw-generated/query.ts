import Block from './block';

function queryEvents(blocks: Block[], query: string): string[] {
  const results: string[] = [];
  for (const block of blocks) {
    if (block.getBloomFilter().has(query)) {
      results.push(...block.queryEventLogs(query));
    }
  }
  return results;
}

export default queryEvents;