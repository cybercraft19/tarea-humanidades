export const DEFAULT_TEAM_AVATAR = "🦉";
export const CARTOON_AVATAR_STYLES = [
  { id: "adventurer", label: "Caricatura" },
  { id: "avataaars", label: "Avatar clasico" },
  { id: "fun-emoji", label: "Emoji animado" },
  { id: "bottts", label: "Robot" },
  { id: "pixel-art", label: "Pixel" },
] as const;

export type CartoonAvatarStyle = (typeof CARTOON_AVATAR_STYLES)[number]["id"];

export type CartoonAvatarOptions = {
  seed?: string;
  style?: CartoonAvatarStyle;
  backgroundColor?: string;
};

export type ManualAvatarProfile = {
  seed: string;
  gender: string;
  skinColor: string;
  hairColor: string;
  top: string;
  eyes: string;
  eyebrows: string;
  mouth: string;
  accessories: string;
  accessoriesColor: string;
  hatColor: string;
  facialHair: string;
  facialHairColor: string;
  clothing: string;
  clothingGraphic: string;
  clothesColor: string;
  backgroundColor: string;
};

export const MANUAL_AVATAR_OPTIONS = {
  gender: [
    { id: "feminino", label: "Femenino" },
    { id: "masculino", label: "Masculino" },
    { id: "no-binario", label: "No binario" },
    { id: "prefiero-no-decir", label: "Prefiero no decir" },
  ],
  skinColor: [
    { id: "f2d3b1", label: "Claro" },
    { id: "e8b98a", label: "Canela" },
    { id: "d08b5b", label: "Moreno" },
    { id: "8d5524", label: "Oscuro" },
  ],
  hairColor: [
    { id: "2c1b18", label: "Negro" },
    { id: "724133", label: "Castano" },
    { id: "b58143", label: "Rubio" },
    { id: "a55728", label: "Pelirrojo" },
    { id: "f5f5f5", label: "Plateado" },
  ],
  top: [
    { id: "bigHair", label: "Voluminoso" },
    { id: "bob", label: "Bob" },
    { id: "bun", label: "Mono" },
    { id: "shortFlat", label: "Cabello corto" },
    { id: "straight01", label: "Cabello largo" },
    { id: "straight02", label: "Liso largo 2" },
    { id: "curly", label: "Rizado" },
    { id: "curvy", label: "Ondulado" },
    { id: "fro", label: "Afro" },
    { id: "dreads", label: "Dreads" },
    { id: "shaggyMullet", label: "Mullet" },
    { id: "theCaesar", label: "Caesar" },
    { id: "hat", label: "Sombrero" },
    { id: "winterHat1", label: "Gorro invierno" },
    { id: "hijab", label: "Hijab" },
    { id: "turban", label: "Turbante" },
  ],
  eyes: [
    { id: "closed", label: "Cerrados" },
    { id: "cry", label: "Llorando" },
    { id: "default", label: "Normal" },
    { id: "eyeRoll", label: "Mirada alta" },
    { id: "happy", label: "Feliz" },
    { id: "hearts", label: "Corazones" },
    { id: "side", label: "Lateral" },
    { id: "wink", label: "Guino" },
    { id: "winkWacky", label: "Guino loco" },
    { id: "xDizzy", label: "Mareado" },
    { id: "surprised", label: "Sorpresa" },
    { id: "squint", label: "Sonrisa" },
  ],
  eyebrows: [
    { id: "angry", label: "Enojadas" },
    { id: "angryNatural", label: "Enojadas natural" },
    { id: "default", label: "Normal" },
    { id: "defaultNatural", label: "Normal natural" },
    { id: "flatNatural", label: "Rectas" },
    { id: "raisedExcited", label: "Elevadas" },
    { id: "raisedExcitedNatural", label: "Elevadas natural" },
    { id: "sadConcerned", label: "Triste" },
    { id: "sadConcernedNatural", label: "Triste natural" },
    { id: "unibrowNatural", label: "Ceja unida" },
    { id: "frownNatural", label: "Serias" },
    { id: "upDown", label: "Asimetricas" },
    { id: "upDownNatural", label: "Asimetricas natural" },
  ],
  mouth: [
    { id: "concerned", label: "Preocupado" },
    { id: "default", label: "Neutral" },
    { id: "disbelief", label: "Incredulo" },
    { id: "eating", label: "Comiendo" },
    { id: "grimace", label: "Mueca" },
    { id: "sad", label: "Triste" },
    { id: "screamOpen", label: "Gritando" },
    { id: "smile", label: "Sonrisa" },
    { id: "serious", label: "Seria" },
    { id: "tongue", label: "Lengua" },
    { id: "twinkle", label: "Brillo" },
    { id: "vomit", label: "Vomito" },
  ],
  accessories: [
    { id: "none", label: "Sin accesorio" },
    { id: "kurt", label: "Kurt" },
    { id: "eyepatch", label: "Parche" },
    { id: "prescription01", label: "Gafas 1" },
    { id: "prescription02", label: "Gafas 2" },
    { id: "round", label: "Lentes redondos" },
    { id: "sunglasses", label: "Lentes" },
    { id: "wayfarers", label: "Wayfarers" },
  ],
  accessoriesColor: [
    { id: "65c9ff", label: "Celeste" },
    { id: "5199e4", label: "Azul" },
    { id: "25557c", label: "Azul oscuro" },
    { id: "e6e6e6", label: "Gris" },
    { id: "ff488e", label: "Rosa" },
    { id: "ff5c5c", label: "Rojo" },
  ],
  hatColor: [
    { id: "65c9ff", label: "Celeste" },
    { id: "5199e4", label: "Azul" },
    { id: "25557c", label: "Azul oscuro" },
    { id: "e6e6e6", label: "Gris" },
    { id: "ff488e", label: "Rosa" },
    { id: "ff5c5c", label: "Rojo" },
  ],
  facialHair: [
    { id: "none", label: "Sin vello facial" },
    { id: "beardMedium", label: "Barba media" },
    { id: "beardLight", label: "Barba ligera" },
    { id: "beardMajestic", label: "Barba larga" },
    { id: "moustacheFancy", label: "Bigote fino" },
    { id: "moustacheMagnum", label: "Bigote grueso" },
  ],
  facialHairColor: [
    { id: "2c1b18", label: "Negro" },
    { id: "724133", label: "Castano" },
    { id: "b58143", label: "Rubio" },
    { id: "a55728", label: "Pelirrojo" },
    { id: "f5f5f5", label: "Plateado" },
  ],
  clothing: [
    { id: "blazerAndShirt", label: "Blazer" },
    { id: "blazerAndSweater", label: "Blazer + sueter" },
    { id: "collarAndSweater", label: "Cuello + sueter" },
    { id: "graphicShirt", label: "Camiseta grafica" },
    { id: "hoodie", label: "Hoodie" },
    { id: "overall", label: "Overol" },
    { id: "shirtCrewNeck", label: "Camiseta" },
    { id: "shirtScoopNeck", label: "Top" },
    { id: "shirtVNeck", label: "V-neck" },
  ],
  clothingGraphic: [
    { id: "bat", label: "Bat" },
    { id: "bear", label: "Bear" },
    { id: "diamond", label: "Diamond" },
    { id: "hola", label: "Hola" },
    { id: "pizza", label: "Pizza" },
    { id: "resist", label: "Resist" },
    { id: "selena", label: "Selena" },
    { id: "skull", label: "Skull" },
    { id: "skullOutline", label: "Skull outline" },
  ],
  clothesColor: [
    { id: "65c9ff", label: "Celeste" },
    { id: "5199e4", label: "Azul" },
    { id: "25557c", label: "Azul oscuro" },
    { id: "e6e6e6", label: "Gris" },
    { id: "ff488e", label: "Rosa" },
    { id: "ff5c5c", label: "Rojo" },
  ],
  backgroundColor: [
    { id: "f4d9ff", label: "Lila" },
    { id: "d9f3ff", label: "Aqua" },
    { id: "d8f5d0", label: "Menta" },
    { id: "ffe2c7", label: "Durazno" },
    { id: "f5f5f5", label: "Perla" },
  ],
} as const;

export function createDefaultManualAvatarProfile(seed = ""): ManualAvatarProfile {
  return {
    seed,
    gender: MANUAL_AVATAR_OPTIONS.gender[2].id,
    skinColor: MANUAL_AVATAR_OPTIONS.skinColor[1].id,
    hairColor: MANUAL_AVATAR_OPTIONS.hairColor[0].id,
    top: MANUAL_AVATAR_OPTIONS.top[0].id,
    eyes: MANUAL_AVATAR_OPTIONS.eyes[0].id,
    eyebrows: MANUAL_AVATAR_OPTIONS.eyebrows[0].id,
    mouth: MANUAL_AVATAR_OPTIONS.mouth[1].id,
    accessories: MANUAL_AVATAR_OPTIONS.accessories[0].id,
    accessoriesColor: MANUAL_AVATAR_OPTIONS.accessoriesColor[0].id,
    hatColor: MANUAL_AVATAR_OPTIONS.hatColor[0].id,
    facialHair: MANUAL_AVATAR_OPTIONS.facialHair[0].id,
    facialHairColor: MANUAL_AVATAR_OPTIONS.facialHairColor[0].id,
    clothing: MANUAL_AVATAR_OPTIONS.clothing[0].id,
    clothingGraphic: MANUAL_AVATAR_OPTIONS.clothingGraphic[0].id,
    clothesColor: MANUAL_AVATAR_OPTIONS.clothesColor[0].id,
    backgroundColor: MANUAL_AVATAR_OPTIONS.backgroundColor[0].id,
  };
}

const MAX_AVATAR_SIZE = 320;

export function isImageAvatar(value?: string | null) {
  if (!value) return false;
  return /^(data:image\/|https?:\/\/|blob:)/i.test(value);
}

export function createCartoonAvatar(options: CartoonAvatarOptions = {}) {
  const {
    seed,
    style = "adventurer",
    backgroundColor,
  } = options;

  const finalSeed = seed || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const query = new URLSearchParams({
    seed: finalSeed,
    backgroundType: "solid",
  });

  if (backgroundColor) {
    query.set("backgroundColor", backgroundColor.replace("#", ""));
  }

  return `https://api.dicebear.com/9.x/${encodeURIComponent(style)}/svg?${query.toString()}`;
}

export function createManualAvatar(profile: ManualAvatarProfile) {
  const seed = profile.seed?.trim() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const query = new URLSearchParams({
    seed,
    backgroundType: "solid",
    backgroundColor: profile.backgroundColor,
    skinColor: profile.skinColor,
    hairColor: profile.hairColor,
    hatColor: profile.hatColor,
    top: profile.top,
    eyes: profile.eyes,
    eyebrows: profile.eyebrows,
    mouth: profile.mouth,
    clothing: profile.clothing,
    clothingGraphic: profile.clothingGraphic,
    clothesColor: profile.clothesColor,
  });

  if (profile.accessories === "none") {
    query.set("accessoriesProbability", "0");
  } else {
    query.set("accessories", profile.accessories);
    query.set("accessoriesColor", profile.accessoriesColor);
  }

  if (profile.facialHair !== "none") {
    query.set("facialHair", profile.facialHair);
    query.set("facialHairColor", profile.facialHairColor);
    query.set("facialHairProbability", "100");
  } else {
    query.set("facialHairProbability", "0");
  }

  return `https://api.dicebear.com/9.x/avataaars/svg?${query.toString()}`;
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