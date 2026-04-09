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

function getInitials(teamName: string) {
  const words = teamName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "ET";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function buildAchievementLines(achievementIds: AchievementId[]) {
  return achievementIds.slice(0, 4).map((id) => ACHIEVEMENTS[id].title);
}

export function buildCertificateSvg(payload: CertificatePayload) {
  const safeTeamName = escapeXml(payload.teamName || "Equipo explorador");
  const safeMembers = escapeXml(payload.teamMembers || "Sin integrantes registrados");
  const safeRoomCode = escapeXml(payload.roomCode || "—");
  const safeDuration = escapeXml(payload.durationLabel || "—");
  const safeDate = escapeXml(payload.completedAtLabel || "—");
  const achievements = buildAchievementLines(payload.achievementIds);
  const initials = escapeXml(getInitials(payload.teamName || "Equipo"));
  const photo = payload.photoDataUrl ? `
        <clipPath id="photoClip">
          <circle cx="1230" cy="370" r="150" />
        </clipPath>
        <image href="${payload.photoDataUrl}" x="1080" y="220" width="300" height="300" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)" />
        <circle cx="1230" cy="370" r="152" fill="none" stroke="rgba(251, 191, 36, 0.95)" stroke-width="10" />
      ` : `
        <circle cx="1230" cy="370" r="150" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(251, 191, 36, 0.95)" stroke-width="10" />
        <text x="1230" y="392" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="86" font-weight="800" fill="#fbbf24">${initials}</text>
        <text x="1230" y="438" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#fde68a">Foto opcional</text>
      `;

  const achievementMarkup = achievements.length === 0
    ? `<text x="190" y="805" font-family="Inter, Arial, sans-serif" font-size="28" fill="#cbd5e1">Sin logros visibles.</text>`
    : achievements.map((title, index) => {
        const column = index % 2;
        const row = Math.floor(index / 2);
        const x = 190 + column * 560;
        const y = 805 + row * 74;
        return `
          <rect x="${x}" y="${y - 34}" width="500" height="52" rx="20" fill="rgba(251, 191, 36, 0.12)" stroke="rgba(251, 191, 36, 0.28)" />
          <text x="${x + 26}" y="${y}" font-family="Inter, Arial, sans-serif" font-size="28" fill="#fef3c7">• ${escapeXml(title)}</text>
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
  <rect x="110" y="100" width="1380" height="900" rx="34" fill="none" stroke="rgba(251, 191, 36, 0.22)" stroke-width="2" stroke-dasharray="12 12" />

  <text x="800" y="170" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="700" letter-spacing="8" fill="#fbbf24">CERTIFICADO AUTOMÁTICO</text>
  <text x="800" y="235" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="58" font-weight="900" fill="#ffffff">La Biblioteca del Tiempo</text>
  <text x="800" y="295" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="500" fill="#cbd5e1">Escape room de comprensión lectora</text>

  <text x="170" y="390" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="#fbbf24">Se otorga a</text>
  <text x="170" y="455" font-family="Inter, Arial, sans-serif" font-size="66" font-weight="900" fill="#ffffff">${safeTeamName}</text>
  <text x="170" y="505" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="500" fill="#cbd5e1">Por completar la misión, resolver los cuatro retos y liberar el conocimiento de la biblioteca.</text>

  <rect x="160" y="575" width="820" height="150" rx="28" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.08)" />
  <g>
    <rect x="190" y="606" width="220" height="88" rx="22" fill="rgba(251, 191, 36, 0.12)" stroke="rgba(251, 191, 36, 0.25)" />
    <text x="220" y="637" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" fill="#fde68a">Sala</text>
    <text x="220" y="676" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="900" fill="#ffffff">${safeRoomCode}</text>

    <rect x="430" y="606" width="220" height="88" rx="22" fill="rgba(59, 130, 246, 0.12)" stroke="rgba(96, 165, 250, 0.24)" />
    <text x="460" y="637" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" fill="#bfdbfe">Tiempo</text>
    <text x="460" y="676" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="900" fill="#ffffff">${safeDuration}</text>

    <rect x="670" y="606" width="280" height="88" rx="22" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(52, 211, 153, 0.24)" />
    <text x="700" y="637" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" fill="#bbf7d0">Fecha</text>
    <text x="700" y="676" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="900" fill="#ffffff">${safeDate}</text>
  </g>

  <g>
    <rect x="1040" y="190" width="400" height="400" rx="36" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(251, 191, 36, 0.22)" />
    ${photo}
    <text x="1240" y="585" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" fill="#cbd5e1">Foto de equipo opcional</text>
  </g>

  <text x="170" y="790" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="800" fill="#fbbf24">Logros visibles</text>
  ${achievementMarkup}

  <rect x="160" y="915" width="1280" height="78" rx="22" fill="rgba(251, 191, 36, 0.08)" stroke="rgba(251, 191, 36, 0.22)" />
  <text x="800" y="965" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="#fef3c7">Equipo: ${safeMembers}</text>

  <text x="800" y="1040" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="500" fill="#94a3b8">Reconocimiento generado automáticamente por el sistema del escape room.</text>
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