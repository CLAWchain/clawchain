import { describe, it, expect } from 'vitest';
import { startAPI, stopAPI } from '../api/api';
import axios from 'axios';

describe('API Endpoints', () => {
  beforeAll(() => {
    startAPI();
  });

  afterAll(() => {
    stopAPI();
  });

  it('should start and stop the API server', () => {
    expect(true).toBe(true);
  });

  it('should handle valid requests', async () => {
    const response = await axios.post('/api/v1/transaction', {
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      value: 100,
      data: '0x1234'
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    });
  });

  it('should handle invalid requests', async () => {
    let response;
    try {
      response = await axios.post('/api/v1/transaction', {
        from: '0x123456789012345678901234567890123456789',
        to: '0x0987654321098765432109876543210987654321',
        value: 100,
        data: '0x1234'
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.error).toBe('Invalid from address');
    }

    try {
      response = await axios.post('/api/v1/transaction', {
        from: '0x1234567890123456789012345678901234567890',
        to: '0x098765432109876543210987654321098765432',
        value: 100,
        data: '0x1234'
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.error).toBe('Invalid to address');
    }
  });

  it('should handle edge cases', async () => {
    // Test zero value transaction
    let response = await axios.post('/api/v1/transaction', {
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      value: 0,
      data: '0x1234'
    });
    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    });

    // Test empty data
    response = await axios.post('/api/v1/transaction', {
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      value: 100,
      data: ''
    });
    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    });
  });
});