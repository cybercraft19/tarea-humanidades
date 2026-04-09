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
  return achievementIds.slice(0, 5).map((id) => ACHIEVEMENTS[id].title);
}

export function buildCertificateSvg(payload: CertificatePayload) {
  const teamName = payload.teamName || "Equipo explorador";
  const members = payload.teamMembers || "Sin integrantes registrados";
  const safeRoomCode = escapeXml(payload.roomCode || "—");
  const safeDuration = escapeXml(payload.durationLabel || "—");
  const safeDate = escapeXml(payload.completedAtLabel || "—");
  const achievements = buildAchievementLines(payload.achievementIds);
  const initials = escapeXml(getInitials(teamName || "Equipo"));
  const teamNameLines = splitIntoLines(teamName, 24, 2);
  const membersLines = splitIntoLines(members, 80, 2);
  const missionLines = splitIntoLines(
    "Por completar la misión, resolver los cuatro retos y liberar el conocimiento de la biblioteca.",
    62,
    2,
  );

  const photo = payload.photoDataUrl ? `
        <clipPath id="photoClip">
          <circle cx="1235" cy="360" r="140" />
        </clipPath>
        <image href="${payload.photoDataUrl}" x="1095" y="220" width="280" height="280" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)" />
        <circle cx="1235" cy="360" r="144" fill="none" stroke="rgba(251, 191, 36, 0.95)" stroke-width="8" />
      ` : `
        <circle cx="1235" cy="360" r="140" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(251, 191, 36, 0.95)" stroke-width="8" />
        <text x="1235" y="382" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="76" font-weight="800" fill="#fbbf24">${initials}</text>
        <text x="1235" y="426" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="22" font-weight="700" fill="#fde68a">Foto opcional</text>
      `;

  const achievementMarkup = achievements.length === 0
    ? `<text x="190" y="792" font-family="Montserrat, Arial, sans-serif" font-size="26" fill="#cbd5e1">Sin logros visibles.</text>`
    : achievements.map((title, index) => {
        const y = 792 + index * 62;
        return `
          <rect x="170" y="${y - 32}" width="1260" height="46" rx="16" fill="rgba(251, 191, 36, 0.10)" stroke="rgba(251, 191, 36, 0.22)" />
          <text x="196" y="${y}" font-family="Montserrat, Arial, sans-serif" font-size="24" fill="#fef3c7">• ${escapeXml(title)}</text>
        `;
      }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="1100" viewBox="0 0 1600 1100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1600" y2="1100" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#020617" />
      <stop offset="0.55" stop-color="#0f172a" />
      <stop offset="1" stop-color="#111827" />
    </linearGradient>
    <linearGradient id="panel" x1="140" y1="130" x2="1460" y2="980" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="rgba(30, 41, 59, 0.98)" />
      <stop offset="1" stop-color="rgba(15, 23, 42, 0.94)" />
    </linearGradient>
    <linearGradient id="gold" x1="170" y1="180" x2="1430" y2="930" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fef3c7" />
      <stop offset="0.5" stop-color="#fbbf24" />
      <stop offset="1" stop-color="#d97706" />
    </linearGradient>
    <filter id="shadow" x="80" y="90" width="1440" height="980" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="22" stdDeviation="28" flood-color="#000000" flood-opacity="0.45" />
    </filter>
  </defs>

  <rect width="1600" height="1100" fill="url(#bg)" />
  <circle cx="260" cy="200" r="190" fill="rgba(251, 191, 36, 0.09)" />
  <circle cx="1360" cy="170" r="150" fill="rgba(59, 130, 246, 0.1)" />
  <circle cx="1260" cy="940" r="210" fill="rgba(251, 191, 36, 0.07)" />

  <rect x="80" y="70" width="1440" height="960" rx="42" fill="url(#panel)" stroke="url(#gold)" stroke-width="3" filter="url(#shadow)" />
  <rect x="110" y="100" width="1380" height="900" rx="34" fill="none" stroke="rgba(251, 191, 36, 0.22)" stroke-width="2" />

  <text x="800" y="166" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="28" font-weight="700" letter-spacing="6" fill="#fbbf24">CERTIFICADO AUTOMATICO</text>
  <text x="800" y="226" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="56" font-weight="900" fill="#ffffff">La Biblioteca del Tiempo</text>
  <text x="800" y="278" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="23" font-weight="500" fill="#cbd5e1">Escape room de comprension lectora</text>

  <text x="170" y="372" font-family="Montserrat, Arial, sans-serif" font-size="22" font-weight="700" fill="#fbbf24">Se otorga a</text>
  <text x="170" y="430" font-family="Montserrat, Arial, sans-serif" font-size="60" font-weight="900" fill="#ffffff">${buildTspans(teamNameLines, 170, 430, 62)}</text>
  <text x="170" y="540" font-family="Montserrat, Arial, sans-serif" font-size="22" font-weight="500" fill="#cbd5e1">${buildTspans(missionLines, 170, 540, 34)}</text>

  <rect x="160" y="610" width="860" height="150" rx="24" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.08)" />
  <g>
    <rect x="190" y="642" width="240" height="88" rx="20" fill="rgba(251, 191, 36, 0.12)" stroke="rgba(251, 191, 36, 0.25)" />
    <text x="220" y="673" font-family="Montserrat, Arial, sans-serif" font-size="18" font-weight="700" fill="#fde68a">Sala</text>
    <text x="220" y="712" font-family="Montserrat, Arial, sans-serif" font-size="30" font-weight="900" fill="#ffffff">${safeRoomCode}</text>

    <rect x="450" y="642" width="240" height="88" rx="20" fill="rgba(59, 130, 246, 0.12)" stroke="rgba(96, 165, 250, 0.24)" />
    <text x="480" y="673" font-family="Montserrat, Arial, sans-serif" font-size="18" font-weight="700" fill="#bfdbfe">Tiempo</text>
    <text x="480" y="712" font-family="Montserrat, Arial, sans-serif" font-size="30" font-weight="900" fill="#ffffff">${safeDuration}</text>

    <rect x="710" y="642" width="280" height="88" rx="20" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(52, 211, 153, 0.24)" />
    <text x="740" y="673" font-family="Montserrat, Arial, sans-serif" font-size="18" font-weight="700" fill="#bbf7d0">Fecha</text>
    <text x="740" y="711" font-family="Montserrat, Arial, sans-serif" font-size="22" font-weight="900" fill="#ffffff">${safeDate}</text>
  </g>

  <g>
    <rect x="1035" y="180" width="410" height="400" rx="30" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(251, 191, 36, 0.22)" />
    ${photo}
    <text x="1240" y="564" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="20" font-weight="700" fill="#cbd5e1">Foto de equipo opcional</text>
  </g>

  <text x="170" y="790" font-family="Montserrat, Arial, sans-serif" font-size="24" font-weight="800" fill="#fbbf24">Logros visibles</text>
  ${achievementMarkup}

  <rect x="160" y="945" width="1280" height="62" rx="18" fill="rgba(251, 191, 36, 0.08)" stroke="rgba(251, 191, 36, 0.22)" />
  <text x="800" y="986" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="20" font-weight="700" fill="#fef3c7">Equipo: ${escapeXml(membersLines.join(" | "))}</text>

  <text x="800" y="1044" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="18" font-weight="500" fill="#94a3b8">Reconocimiento generado automaticamente por el sistema del escape room.</text>
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