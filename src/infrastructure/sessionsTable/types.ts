import type { VerifiedGoogleUser } from "../googleAuth/types";

export type Session = VerifiedGoogleUser & {
  expiresAt: number;
  id: string;
};
