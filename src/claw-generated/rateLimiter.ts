import { WalletAddress } from '../wallet/types';
import { createCanvas, loadImage } from 'canvas';
import { randomBytes } from 'crypto';

export class RateLimiter {
  private ipRequestCounts: Map<string, number> = new Map();
  private walletRequestCounts: Map<WalletAddress, number> = new Map();
  private captchas: Map<string, string> = new Map();
  private cooldownPeriod = 60 * 1000; // 1 minute

  canMakeRequest(ipAddress: string, walletAddress: WalletAddress): boolean {
    const ipRequestCount = this.ipRequestCounts.get(ipAddress) || 0;
    const walletRequestCount = this.walletRequestCounts.get(walletAddress) || 0;

    if (ipRequestCount >= 10 || walletRequestCount >= 5) {
      return false;
    }

    return true;
  }

  recordRequest(ipAddress: string, walletAddress: WalletAddress): void {
    this.ipRequestCounts.set(ipAddress, (this.ipRequestCounts.get(ipAddress) || 0) + 1);
    this.walletRequestCounts.set(walletAddress, (this.walletRequestCounts.get(walletAddress) || 0) + 1);

    setTimeout(() => {
      this.ipRequestCounts.delete(ipAddress);
      this.walletRequestCounts.delete(walletAddress);
    }, this.cooldownPeriod);
  }

  async generateCaptcha(): Promise<{ captchaId: string; captchaImage: string }> {
    const captchaId = randomBytes(16).toString('hex');
    const captchaText = this.generateCaptchaText();
    this.captchas.set(captchaId, captchaText);

    const canvas = createCanvas(150, 50);
    const ctx = canvas.getContext('2d');

    // Draw the captcha text on the canvas
    ctx.font = '30px Arial';
    ctx.fillText(captchaText, 20, 35);

    // Convert the canvas to a data URL
    const captchaImage = canvas.toDataURL('image/png');

    return { captchaId, captchaImage };
  }

  verifyCaptcha(captchaId: string, captchaText: string): boolean {
    const storedCaptchaText = this.captchas.get(captchaId);
    if (storedCaptchaText && storedCaptchaText === captchaText) {
      this.captchas.delete(captchaId);
      return true;
    }
    return false;
  }

  private generateCaptchaText(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let captchaText = '';
    for (let i = 0; i < 6; i++) {
      captchaText += chars[Math.floor(Math.random() * chars.length)];
    }
    return captchaText;
  }
}