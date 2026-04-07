import { ContactEntryClient } from "@/components/contact/contact-entry-client";
import { LinkButton } from "@/components/links/link-button";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ensureSeedUser, getUser, listLinks } from "@/lib/store";
import { notFound } from "next/navigation";

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;

  await ensureSeedUser();

  const user = await getUser(username);
  if (!user) notFound();

  const links = await listLinks(username);

  return (
    <div className="flex flex-1 justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <ProfileHeader imageUrl={user.imageUrl} nickname={user.nickname} bio={user.bio} />

        <div className="mt-3 flex flex-col gap-3">
          {links.map((l) => (
            <LinkButton
              key={l.id}
              username={username}
              linkId={l.id}
              type={l.type}
              title={l.title}
              url={l.url}
            />
          ))}
        </div>

        <PublicFooter username={username} />
      </div>
    </div>
  );
}

function PublicFooter({ username }: { username: string }) {
  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <ContactEntry username={username} />
      <p className="text-xs text-black/40 dark:text-white/40">
        © {new Date().getFullYear()} Link-in-Bio
      </p>
    </div>
  );
}

function ContactEntry({ username }: { username: string }) {
  return <ContactEntryClient username={username} />;
}

