import { generateCaptcha, verifyCaptcha } from '../utils/captcha';

export class CaptchaChallenge {
  private captchas: Map<string, string> = new Map();

  generateChallenge(ip: string): string {
    const captcha = generateCaptcha();
    this.captchas.set(ip, captcha);
    return captcha;
  }

  async verify(ip: string, solution: string): Promise<boolean> {
    const captcha = this.captchas.get(ip);
    if (!captcha) {
      return false;
    }

    const isValid = await verifyCaptcha(captcha, solution);
    if (isValid) {
      this.captchas.delete(ip);
    }
    return isValid;
  }
}