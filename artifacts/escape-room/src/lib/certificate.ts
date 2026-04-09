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
  const achievements = buildAchievementLines(payload.achievementIds);
  const initials = escapeXml(getInitials(teamName || "Equipo"));
  const teamNameLines = splitIntoLines(teamName, 26, 2);
  const membersLines = splitIntoLines(members, 70, 1);
  const missionLines = splitIntoLines(
    "Por completar la mision y resolver los retos de lectura.",
    48,
    2,
  );

  const photo = payload.photoDataUrl ? `
        <clipPath id="photoClip">
          <circle cx="1110" cy="290" r="110" />
        </clipPath>
        <image href="${payload.photoDataUrl}" x="1000" y="180" width="220" height="220" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)" />
        <circle cx="1110" cy="290" r="112" fill="none" stroke="#fbbf24" stroke-width="6" />
      ` : `
        <circle cx="1110" cy="290" r="110" fill="#0f172a" stroke="#fbbf24" stroke-width="6" />
        <text x="1110" y="308" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="56" font-weight="800" fill="#fbbf24">${initials}</text>
      `;

  const achievementMarkup = achievements.length === 0
    ? `<text x="160" y="650" font-family="Montserrat, Arial, sans-serif" font-size="22" fill="#94a3b8">Sin logros destacados.</text>`
    : achievements.map((title, index) => {
        const y = 650 + index * 44;
        return `
          <text x="160" y="${y}" font-family="Montserrat, Arial, sans-serif" font-size="24" fill="#e2e8f0">• ${escapeXml(title)}</text>
        `;
      }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1400" height="900" viewBox="0 0 1400 900" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1400" y2="900" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#020617" />
      <stop offset="0.55" stop-color="#0f172a" />
      <stop offset="1" stop-color="#111827" />
    </linearGradient>
    <linearGradient id="panel" x1="90" y1="80" x2="1310" y2="820" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="rgba(30, 41, 59, 0.98)" />
      <stop offset="1" stop-color="rgba(15, 23, 42, 0.94)" />
    </linearGradient>
    <linearGradient id="gold" x1="120" y1="120" x2="1280" y2="760" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fef3c7" />
      <stop offset="0.5" stop-color="#fbbf24" />
      <stop offset="1" stop-color="#d97706" />
    </linearGradient>
    <filter id="shadow" x="50" y="50" width="1300" height="820" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.45" />
    </filter>
  </defs>

  <rect width="1400" height="900" fill="url(#bg)" />
  <circle cx="220" cy="160" r="160" fill="rgba(251, 191, 36, 0.08)" />
  <circle cx="1240" cy="120" r="120" fill="rgba(59, 130, 246, 0.08)" />

  <rect x="70" y="60" width="1260" height="780" rx="36" fill="url(#panel)" stroke="url(#gold)" stroke-width="3" filter="url(#shadow)" />
  <rect x="92" y="82" width="1216" height="736" rx="28" fill="none" stroke="rgba(251, 191, 36, 0.22)" stroke-width="2" />

  <text x="700" y="145" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="42" font-weight="900" fill="#ffffff">CERTIFICADO</text>
  <text x="700" y="182" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="26" font-weight="700" fill="#fbbf24">La Biblioteca del Tiempo</text>

  <text x="160" y="260" font-family="Montserrat, Arial, sans-serif" font-size="22" font-weight="700" fill="#fbbf24">Otorgado a</text>
  <text x="160" y="314" font-family="Montserrat, Arial, sans-serif" font-size="54" font-weight="900" fill="#ffffff">${buildTspans(teamNameLines, 160, 314, 58)}</text>
  <text x="160" y="418" font-family="Montserrat, Arial, sans-serif" font-size="24" font-weight="500" fill="#cbd5e1">${buildTspans(missionLines, 160, 418, 34)}</text>

  <rect x="150" y="462" width="760" height="132" rx="20" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.08)" />
  <g>
    <rect x="175" y="486" width="220" height="84" rx="16" fill="rgba(251, 191, 36, 0.14)" />
    <text x="198" y="516" font-family="Montserrat, Arial, sans-serif" font-size="18" font-weight="700" fill="#fde68a">Sala</text>
    <text x="198" y="552" font-family="Montserrat, Arial, sans-serif" font-size="36" font-weight="900" fill="#ffffff">${safeRoomCode}</text>

    <rect x="420" y="486" width="220" height="84" rx="16" fill="rgba(59, 130, 246, 0.14)" />
    <text x="443" y="516" font-family="Montserrat, Arial, sans-serif" font-size="18" font-weight="700" fill="#bfdbfe">Tiempo</text>
    <text x="443" y="552" font-family="Montserrat, Arial, sans-serif" font-size="36" font-weight="900" fill="#ffffff">${safeDuration}</text>

    <rect x="665" y="486" width="220" height="84" rx="16" fill="rgba(16, 185, 129, 0.14)" />
    <text x="688" y="516" font-family="Montserrat, Arial, sans-serif" font-size="18" font-weight="700" fill="#bbf7d0">Fecha</text>
    <text x="688" y="550" font-family="Montserrat, Arial, sans-serif" font-size="24" font-weight="900" fill="#ffffff">${safeDate}</text>
  </g>

  <g>
    <rect x="945" y="160" width="330" height="460" rx="24" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(251, 191, 36, 0.22)" />
    ${photo}
    <text x="1110" y="450" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="19" font-weight="700" fill="#cbd5e1">Foto opcional</text>
  </g>

  <text x="160" y="620" font-family="Montserrat, Arial, sans-serif" font-size="26" font-weight="800" fill="#fbbf24">Logros</text>
  ${achievementMarkup}

  <rect x="150" y="752" width="1120" height="42" rx="12" fill="rgba(251, 191, 36, 0.08)" stroke="rgba(251, 191, 36, 0.22)" />
  <text x="710" y="780" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="18" font-weight="700" fill="#fef3c7">Equipo: ${escapeXml(membersLines.join(" | "))}</text>
  <text x="700" y="822" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="14" font-weight="500" fill="#94a3b8">Generado automaticamente por el sistema del escape room.</text>
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