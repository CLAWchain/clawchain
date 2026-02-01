import { createCanvas, loadImage } from 'canvas';

interface Captcha {
  text: string;
  image: Buffer;
}

export function generateCaptcha(): Captcha {
  const canvas = createCanvas(200, 50);
  const ctx = canvas.getContext('2d');

  // Generate random text
  const text = Math.random().toString(36).substring(2, 8);

  // Draw text on canvas
  ctx.font = '30px Arial';
  ctx.fillText(text, 20, 35);

  return {
    text,
    image: canvas.toBuffer('image/png')
  };
}

export function verifyCaptcha(expected: string, actual: string): boolean {
  return expected.toLowerCase() === actual.toLowerCase();
}