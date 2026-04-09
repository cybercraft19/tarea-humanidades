import { useState } from "react";
import { cn } from "@/lib/utils";
import { DEFAULT_TEAM_AVATAR, isImageAvatar } from "@/lib/avatarUtils";

type PlayerAvatarProps = {
  avatar?: string;
  alt?: string;
  className?: string;
  emojiClassName?: string;
};

export default function PlayerAvatar({
  avatar,
  alt = "Avatar",
  className,
  emojiClassName,
}: PlayerAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const finalAvatar = avatar || DEFAULT_TEAM_AVATAR;
  const shouldRenderImage = isImageAvatar(finalAvatar) && !imageFailed;

  if (shouldRenderImage) {
    return (
      <img
        src={finalAvatar}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
        className={cn("h-10 w-10 rounded-full border border-white/20 object-cover", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl leading-none",
        className,
        emojiClassName,
      )}
      aria-label={alt}
    >
      {finalAvatar}
    </span>
  );
}