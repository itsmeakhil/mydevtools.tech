export function getIPClass({ ip }: { ip: string }): string {
  const firstOctet = parseInt(ip.split('.')[0]);
  if (firstOctet < 128) return 'A';
  if (firstOctet < 192) return 'B';
  if (firstOctet < 224) return 'C';
  if (firstOctet < 240) return 'D';
  return 'E';
}
