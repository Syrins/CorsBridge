import ipaddr from 'ipaddr.js';

function tryParse(ip: string): ipaddr.IPv4 | ipaddr.IPv6 | null {
  try {
    if (!ipaddr.isValid(ip)) {
      return null;
    }
    return ipaddr.parse(ip);
  } catch {
    return null;
  }
}

export function normalizeIp(ip: string | undefined | null): string {
  if (!ip) {
    return 'unknown';
  }

  const parsed = tryParse(ip.trim());
  if (!parsed) {
    return ip.trim().toLowerCase();
  }

  if (parsed.kind() === 'ipv6' && (parsed as ipaddr.IPv6).isIPv4MappedAddress()) {
    return (parsed as ipaddr.IPv6).toIPv4Address().toString();
  }

  return parsed.toNormalizedString();
}

export function isPrivateIp(ip: string): boolean {
  const parsed = tryParse(ip);
  if (!parsed) {
    return false;
  }

  const range = parsed.range();
  if (range === 'loopback' || range === 'private' || range === 'linkLocal' || range === 'uniqueLocal') {
    return true;
  }

  if (parsed.kind() === 'ipv4') {
    const [octet1, octet2] = (parsed as ipaddr.IPv4).octets;
    if (octet1 === 100 && octet2 >= 64 && octet2 <= 127) {
      // Carrier grade NAT (100.64.0.0/10)
      return true;
    }
    if (octet1 === 0 || octet1 === 255) {
      return true;
    }
  }

  return false;
}

export function matchesCidr(ip: string, cidr: string): boolean {
  const parsed = tryParse(ip);
  if (!parsed) {
    return false;
  }

  try {
    const range = ipaddr.parseCIDR(cidr);
    const [rangeAddress, rangePrefix] = range;

    if (parsed.kind() === 'ipv4' && rangeAddress.kind() === 'ipv4') {
      return (parsed as ipaddr.IPv4).match([rangeAddress as ipaddr.IPv4, rangePrefix]);
    }

    if (parsed.kind() === 'ipv6' && rangeAddress.kind() === 'ipv6') {
      return (parsed as ipaddr.IPv6).match([rangeAddress as ipaddr.IPv6, rangePrefix]);
    }

    return false;
  } catch {
    return false;
  }
}
