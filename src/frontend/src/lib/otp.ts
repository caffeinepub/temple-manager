export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function verifyOtp(input: string, expected: string): boolean {
  return input.trim() === expected;
}
