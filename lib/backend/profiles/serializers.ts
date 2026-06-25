import type { ProfileRecord, PublicProfile } from "@/lib/backend/profiles/types";

export function toPublicProfile(profile: ProfileRecord): PublicProfile {
  return {
    id: profile.id,
    createdAt: profile.createdAt,
    name: profile.name,
    title: profile.title,
    bio: profile.bio,
    photoUrl: profile.photoUrl,
    links: profile.links,
  };
}
