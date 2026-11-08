export default function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) {
    return duration;
  }

  const hours = parseInt(match[1] || "0") || 0;
  const minutes = parseInt(match[2] || "0") || 0;
  const seconds = parseInt(match[3] || "0") || 0;

  const clockSeconds = seconds.toString().padStart(2, "0");
  return hours > 0
    ? `${hours}:${minutes.toString().padStart(2, "0")}:${clockSeconds}`
    : `${minutes}:${clockSeconds}`;
}
