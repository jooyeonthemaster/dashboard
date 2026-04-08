import { getMemberBySlug, MEMBERS } from "@/lib/members";
import { notFound } from "next/navigation";
import PersonalWorkspace from "@/components/personal/PersonalWorkspace";

export default function PersonalNotePage({
  params,
}: {
  params: { slug: string };
}) {
  const member = getMemberBySlug(params.slug);
  if (!member) notFound();

  return <PersonalWorkspace member={member} allMembers={MEMBERS} />;
}
