export function createRandomPastelColorForString(str: string) {
  const hash = str.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return `hsl(${hash % 360}, 50%, 80%)`;
}
