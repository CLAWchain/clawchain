import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import NetworkStats from '../NetworkStats';

jest.mock('axios');

describe('NetworkStats', () => {
  it('displays network statistics', async () => {
    const mockStats = {
      tps: 10.5,
      blockTime: 12.3,
      difficulty: 1234.56,
      hashrate: 100000.0,
      activeAddresses: 12345
    };

    (axios.get as jest.Mock).mockResolvedValue({ data: mockStats });

    render(<NetworkStats />);

    await waitFor(() => {
      expect(screen.getByText('10.50')).toBeInTheDocument();
      expect(screen.getByText('12.30 seconds')).toBeInTheDocument();
      expect(screen.getByText('1234.56')).toBeInTheDocument();
      expect(screen.getByText('100,000.00 H/s')).toBeInTheDocument();
      expect(screen.getByText('12,345')).toBeInTheDocument();
    });
  });
});