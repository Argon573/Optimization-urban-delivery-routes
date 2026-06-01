export function parseAddress(address) {
    const commaMatch = address.match(/^(.*?),\s*(.+)$/);
    if (commaMatch) {
        return [commaMatch[1], commaMatch[2]];
    }

    const spaceMatch = address.match(/^(.*?)\s+([^\s]+)$/);
    if (spaceMatch) {
        return [spaceMatch[1], spaceMatch[2]];
    }

    return [address, ''];
}
