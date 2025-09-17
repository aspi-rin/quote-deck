export const parseMemoBlock = (block: string): string[] => {
  return block
    .split(/\r?\n{2,}/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
};
