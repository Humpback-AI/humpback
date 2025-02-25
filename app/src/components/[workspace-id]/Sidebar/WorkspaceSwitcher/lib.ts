export function getColorFromName(name: string): string {
  const colors = [
    "bg-purple-600",
    "bg-blue-600",
    "bg-indigo-600",
    "bg-pink-600",
    "bg-teal-600",
    "bg-green-600",
    "bg-red-600",
  ];

  // Create a simple hash from the name
  const hash = name.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Use the hash to select a color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
