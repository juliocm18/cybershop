import {Role} from "../role/model";

export type User = {
  id?: string;
  email: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  phone?: string;
  roles?: Role[];
  password?: string;
  departments?: string[];
};

// aud: string;
// confirmation_sent_at: string;
// confirmed_at: string;
// created_at: string;
//   user_metadata: {
//     email: string;
//     email_verified: boolean;
//     phone_verified: boolean;
//     sub: string;
//   };
// role: string;
// updated_at: string;
// is_anonymous: boolean;

export interface clientProfile {
  avatar_url: string;
  name: string;
  birth_date: string;
  phone_number: string;
  email: string;
  gender: string;
  sexual_preference: string;
  profession: string;
  description: string;
  zodiac_sign: string;
  hobbies: string[];
  accept_media_naranja: boolean;
}