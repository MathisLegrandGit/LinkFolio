export type ProfileLink = {
  label: string;
  url: string;
};

export type ProfileInput = {
  name: string;
  title: string;
  bio: string;
  photoUrl: string;
  links: ProfileLink[];
};

export type ProfileRecord = ProfileInput & {
  id: string;
  editToken: string;
  createdAt: string;
};

export type PublicProfile = Omit<ProfileRecord, "editToken">;
