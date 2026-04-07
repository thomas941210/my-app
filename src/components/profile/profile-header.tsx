import Image from "next/image";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function ProfileHeader({
  imageUrl,
  nickname,
  bio,
}: {
  imageUrl?: string;
  nickname: string;
  bio: string;
}) {
  return (
    <div className="relative w-full pt-8 pb-6">
      <div className="absolute right-0 top-6">
        <ThemeToggle compact />
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="h-24 w-24 overflow-hidden rounded-full border border-black/10 bg-[color:var(--card)] dark:border-white/10">
          <Image
            src={imageUrl || "/avatar-demo.svg"}
            alt={`${nickname} 프로필 이미지`}
            width={96}
            height={96}
            className="h-full w-full object-cover"
            priority
          />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">{nickname}</h1>
        <p className="mt-2 max-w-[28rem] text-[15px] leading-6 text-black/60 dark:text-white/70">
          {bio}
        </p>
      </div>
    </div>
  );
}

