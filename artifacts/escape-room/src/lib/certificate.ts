import { ACHIEVEMENTS, type AchievementId } from "@/lib/achievements";

export interface CertificatePayload {
  teamName: string;
  teamMembers: string;
  roomCode: string;
  durationLabel: string;
  completedAtLabel: string;
  achievementIds: AchievementId[];
  photoDataUrl?: string | null;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function splitIntoLines(value: string, maxCharsPerLine: number, maxLines: number) {
  const words = (value || "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine || !current) {
      current = candidate;
      continue;
    }

    lines.push(current);
    current = word;
    if (lines.length >= maxLines - 1) break;
  }

  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

function buildTspans(lines: string[], x: number, firstY: number, lineHeight: number) {
  return lines
    .map((line, index) => `<tspan x="${x}" y="${firstY + lineHeight * index}">${escapeXml(line)}</tspan>`)
    .join("");
}

function getInitials(teamName: string) {
  const words = teamName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "ET";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function buildAchievementLines(achievementIds: AchievementId[]) {
  return achievementIds.slice(0, 3).map((id) => ACHIEVEMENTS[id].title);
}

export function buildCertificateSvg(payload: CertificatePayload) {
  const teamName = payload.teamName || "Equipo explorador";
  const members = payload.teamMembers || "Sin integrantes registrados";
  const safeRoomCode = escapeXml(payload.roomCode || "—");
  const safeDuration = escapeXml(payload.durationLabel || "—");
  const safeDate = escapeXml(payload.completedAtLabel || "—");
  const membersLines = splitIntoLines(members, 80, 1);

  const photo = payload.photoDataUrl ? `
        <clipPath id="photoClip">
          <circle cx="1050" cy="240" r="90" />
        </clipPath>
        <image href="${payload.photoDataUrl}" x="960" y="150" width="180" height="180" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)" />
        <circle cx="1050" cy="240" r="92" fill="none" stroke="#fbbf24" stroke-width="4" />
      ` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="750" viewBox="0 0 1200 750" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="750" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#020617" />
      <stop offset="0.5" stop-color="#0f172a" />
      <stop offset="1" stop-color="#111827" />
    </linearGradient>
    <linearGradient id="gold" x1="60" y1="60" x2="1140" y2="690" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fef3c7" />
      <stop offset="0.5" stop-color="#fbbf24" />
      <stop offset="1" stop-color="#d97706" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="750" fill="url(#bg)" />
  
  <!-- Decorative elements -->
  <circle cx="150" cy="120" r="100" fill="rgba(251, 191, 36, 0.06)" />
  <circle cx="1050" cy="650" r="80" fill="rgba(59, 130, 246, 0.06)" />

  <!-- Main border -->
  <rect x="50" y="40" width="1100" height="670" rx="24" fill="none" stroke="url(#gold)" stroke-width="2.5" />
  <rect x="60" y="50" width="1080" height="650" rx="20" fill="rgba(15, 23, 42, 0.5)" stroke="rgba(251, 191, 36, 0.15)" stroke-width="1" />

  <!-- Header -->
  <text x="600" y="120" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="32" font-weight="900" fill="#ffffff">CERTIFICADO</text>
  <line x1="150" y1="135" x2="1050" y2="135" stroke="rgba(251, 191, 36, 0.3)" stroke-width="1.5" />
  <text x="600" y="165" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="18" font-weight="700" fill="#fbbf24">La Biblioteca del Tiempo</text>

  <!-- Team name -->
  <text x="120" y="220" font-family="Montserrat, Arial, sans-serif" font-size="16" font-weight="600" fill="#cbd5e1">Ha completado la misión:</text>
  <text x="120" y="270" font-family="Montserrat, Arial, sans-serif" font-size="48" font-weight="900" fill="#ffffff">${escapeXml(teamName)}</text>

  <!-- Metrics row -->
  <rect x="120" y="320" width="800" height="80" rx="12" fill="rgba(251, 191, 36, 0.08)" stroke="rgba(251, 191, 36, 0.2)" stroke-width="1.5" />
  
  <text x="160" y="345" font-family="Montserrat, Arial, sans-serif" font-size="13" font-weight="700" fill="#fbbf24" letter-spacing="1">SALA</text>
  <text x="160" y="385" font-family="Montserrat, Arial, sans-serif" font-size="36" font-weight="900" fill="#fef3c7">${safeRoomCode}</text>

  <line x1="380" y1="330" x2="380" y2="400" stroke="rgba(251, 191, 36, 0.25)" stroke-width="1" />

  <text x="420" y="345" font-family="Montserrat, Arial, sans-serif" font-size="13" font-weight="700" fill="#bfdbfe" letter-spacing="1">TIEMPO</text>
  <text x="420" y="385" font-family="Montserrat, Arial, sans-serif" font-size="36" font-weight="900" fill="#fef3c7">${safeDuration}</text>

  <line x1="640" y1="330" x2="640" y2="400" stroke="rgba(251, 191, 36, 0.25)" stroke-width="1" />

  <text x="680" y="345" font-family="Montserrat, Arial, sans-serif" font-size="13" font-weight="700" fill="#bbf7d0" letter-spacing="1">FECHA</text>
  <text x="680" y="380" font-family="Montserrat, Arial, sans-serif" font-size="20" font-weight="900" fill="#fef3c7">${safeDate}</text>

  <!-- Photo section (if available) -->
  ${photo}

  <!-- Footer section -->
  <line x1="120" y1="430" x2="1080" y2="430" stroke="rgba(251, 191, 36, 0.2)" stroke-width="1" />
  
  <text x="600" y="475" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="14" font-weight="600" fill="#cbd5e1">Equipo: ${escapeXml(membersLines.join(" • "))}</text>
  
  <text x="600" y="540" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="11" font-weight="500" fill="#94a3b8">Generado por el sistema del escape room</text>
  <text x="600" y="560" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="11" font-weight="500" fill="#94a3b8">La Biblioteca del Tiempo - ${safeDate}</text>

</svg>`;
}

export function buildCertificateFileName(teamName: string) {
  const normalized = (teamName || "equipo")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `certificado-${normalized || "equipo"}.svg`;
}