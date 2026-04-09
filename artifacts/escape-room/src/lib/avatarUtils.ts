export const DEFAULT_TEAM_AVATAR = "🦉";

const MAX_AVATAR_SIZE = 320;

export function isImageAvatar(value?: string | null) {
  if (!value) return false;
  return /^(data:image\/|https?:\/\/|blob:)/i.test(value);
}

export function createCartoonAvatar(seed?: string) {
  const finalSeed = seed || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(finalSeed)}&backgroundType=gradientLinear`;
}

function readFileAsDataURL(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo procesar la imagen."));
    img.src = src;
  });
}

export async function createAvatarFromFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Archivo no compatible.");
  }

  const dataUrl = await readFileAsDataURL(file);
  const image = await loadImage(dataUrl);

  const scale = Math.min(1, MAX_AVATAR_SIZE / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No se pudo crear la imagen.");
  }

  ctx.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.84);
}