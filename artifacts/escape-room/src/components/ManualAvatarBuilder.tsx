import {
  MANUAL_AVATAR_OPTIONS,
  type ManualAvatarProfile,
} from "@/lib/avatarUtils";

type ManualAvatarBuilderProps = {
  profile: ManualAvatarProfile;
  onProfileChange: (next: ManualAvatarProfile) => void;
  onApply: () => void;
};

export default function ManualAvatarBuilder({
  profile,
  onProfileChange,
  onApply,
}: ManualAvatarBuilderProps) {
  const setValue = (key: keyof ManualAvatarProfile, value: string) => {
    onProfileChange({ ...profile, [key]: value });
  };

  return (
    <div className="mt-3 rounded-xl border border-white/15 bg-black/20 p-3 space-y-3">
      <p className="text-[11px] uppercase tracking-widest text-slate-300">Taller de avatar (manual)</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          type="text"
          value={profile.seed}
          onChange={(e) => setValue("seed", e.target.value)}
          placeholder="Semilla: tu nombre o apodo"
          className="rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-[11px] text-white placeholder-slate-400"
        />

        <select
          value={profile.gender}
          onChange={(e) => setValue("gender", e.target.value)}
          className="rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-[11px] font-semibold text-white"
        >
          {MANUAL_AVATAR_OPTIONS.gender.map((item) => (
            <option key={item.id} value={item.id} className="bg-slate-900 text-white">
              Genero: {item.label}
            </option>
          ))}
        </select>

        <select
          value={profile.top}
          onChange={(e) => setValue("top", e.target.value)}
          className="rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-[11px] font-semibold text-white"
        >
          {MANUAL_AVATAR_OPTIONS.top.map((item) => (
            <option key={item.id} value={item.id} className="bg-slate-900 text-white">
              Cabello: {item.label}
            </option>
          ))}
        </select>

        <select
          value={profile.skinColor}
          onChange={(e) => setValue("skinColor", e.target.value)}
          className="rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-[11px] font-semibold text-white"
        >
          {MANUAL_AVATAR_OPTIONS.skinColor.map((item) => (
            <option key={item.id} value={item.id} className="bg-slate-900 text-white">
              Piel: {item.label}
            </option>
          ))}
        </select>

        <select
          value={profile.hairColor}
          onChange={(e) => setValue("hairColor", e.target.value)}
          className="rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-[11px] font-semibold text-white"
        >
          {MANUAL_AVATAR_OPTIONS.hairColor.map((item) => (
            <option key={item.id} value={item.id} className="bg-slate-900 text-white">
              Color cabello: {item.label}
            </option>
          ))}
        </select>

        <select
          value={profile.eyes}
          onChange={(e) => setValue("eyes", e.target.value)}
          className="rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-[11px] font-semibold text-white"
        >
          {MANUAL_AVATAR_OPTIONS.eyes.map((item) => (
            <option key={item.id} value={item.id} className="bg-slate-900 text-white">
              Ojos: {item.label}
            </option>
          ))}
        </select>

        <select
          value={profile.eyebrows}
          onChange={(e) => setValue("eyebrows", e.target.value)}
          className="rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-[11px] font-semibold text-white"
        >
          {MANUAL_AVATAR_OPTIONS.eyebrows.map((item) => (
            <option key={item.id} value={item.id} className="bg-slate-900 text-white">
              Cejas: {item.label}
            </option>
          ))}
        </select>

        <select
          value={profile.mouth}
          onChange={(e) => setValue("mouth", e.target.value)}
          className="rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-[11px] font-semibold text-white"
        >
          {MANUAL_AVATAR_OPTIONS.mouth.map((item) => (
            <option key={item.id} value={item.id} className="bg-slate-900 text-white">
              Boca: {item.label}
            </option>
          ))}
        </select>

        <select
          value={profile.accessories}
          onChange={(e) => setValue("accessories", e.target.value)}
          className="rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-[11px] font-semibold text-white"
        >
          {MANUAL_AVATAR_OPTIONS.accessories.map((item) => (
            <option key={item.id} value={item.id} className="bg-slate-900 text-white">
              Accesorio: {item.label}
            </option>
          ))}
        </select>

        <select
          value={profile.clothingGraphic}
          onChange={(e) => setValue("clothingGraphic", e.target.value)}
          className="rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-[11px] font-semibold text-white"
        >
          {MANUAL_AVATAR_OPTIONS.clothingGraphic.map((item) => (
            <option key={item.id} value={item.id} className="bg-slate-900 text-white">
              Grafico: {item.label}
            </option>
          ))}
        </select>

        <select
          value={profile.facialHair}
          onChange={(e) => setValue("facialHair", e.target.value)}
          className="rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-[11px] font-semibold text-white"
        >
          {MANUAL_AVATAR_OPTIONS.facialHair.map((item) => (
            <option key={item.id} value={item.id} className="bg-slate-900 text-white">
              Vello facial: {item.label}
            </option>
          ))}
        </select>

        <select
          value={profile.facialHairColor}
          onChange={(e) => setValue("facialHairColor", e.target.value)}
          className="rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-[11px] font-semibold text-white"
        >
          {MANUAL_AVATAR_OPTIONS.facialHairColor.map((item) => (
            <option key={item.id} value={item.id} className="bg-slate-900 text-white">
              Color vello: {item.label}
            </option>
          ))}
        </select>

        <select
          value={profile.clothing}
          onChange={(e) => setValue("clothing", e.target.value)}
          className="rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-[11px] font-semibold text-white"
        >
          {MANUAL_AVATAR_OPTIONS.clothing.map((item) => (
            <option key={item.id} value={item.id} className="bg-slate-900 text-white">
              Ropa: {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-slate-300">Color piel:</span>
        <input
          type="color"
          value={`#${profile.skinColor}`}
          onChange={(e) => setValue("skinColor", e.target.value.replace("#", ""))}
          className="h-7 w-9 rounded border border-white/20 bg-transparent p-0"
          aria-label="Color piel"
        />
        <span className="text-[11px] text-slate-300">Cabello:</span>
        <input
          type="color"
          value={`#${profile.hairColor}`}
          onChange={(e) => setValue("hairColor", e.target.value.replace("#", ""))}
          className="h-7 w-9 rounded border border-white/20 bg-transparent p-0"
          aria-label="Color cabello"
        />
        <span className="text-[11px] text-slate-300">Vello:</span>
        <input
          type="color"
          value={`#${profile.facialHairColor}`}
          onChange={(e) => setValue("facialHairColor", e.target.value.replace("#", ""))}
          className="h-7 w-9 rounded border border-white/20 bg-transparent p-0"
          aria-label="Color vello"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-slate-300">Color ropa:</span>
        {MANUAL_AVATAR_OPTIONS.clothesColor.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setValue("clothesColor", item.id)}
            title={item.label}
            className={`h-5 w-5 rounded-full border ${profile.clothesColor === item.id ? "border-white" : "border-white/30"}`}
            style={{ backgroundColor: `#${item.id}` }}
            aria-label={`Color ropa ${item.label}`}
          />
        ))}
        <span className="text-[11px] text-slate-300 ml-2">Personalizado:</span>
        <input
          type="color"
          value={`#${profile.clothesColor}`}
          onChange={(e) => setValue("clothesColor", e.target.value.replace("#", ""))}
          className="h-7 w-9 rounded border border-white/20 bg-transparent p-0"
          aria-label="Color ropa personalizado"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-slate-300">Fondo:</span>
        {MANUAL_AVATAR_OPTIONS.backgroundColor.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setValue("backgroundColor", item.id)}
            title={item.label}
            className={`h-5 w-5 rounded-full border ${profile.backgroundColor === item.id ? "border-white" : "border-white/30"}`}
            style={{ backgroundColor: `#${item.id}` }}
            aria-label={`Fondo ${item.label}`}
          />
        ))}
        <span className="text-[11px] text-slate-300 ml-2">Personalizado:</span>
        <input
          type="color"
          value={`#${profile.backgroundColor}`}
          onChange={(e) => setValue("backgroundColor", e.target.value.replace("#", ""))}
          className="h-7 w-9 rounded border border-white/20 bg-transparent p-0"
          aria-label="Color fondo personalizado"
        />
      </div>

      <button
        type="button"
        onClick={onApply}
        className="rounded-lg border border-cyan-300/35 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-bold text-cyan-100"
      >
        Aplicar mi avatar manual
      </button>
    </div>
  );
}
