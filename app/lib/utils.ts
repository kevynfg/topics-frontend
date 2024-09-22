import { scopes } from "app/config/scopes";
import { GoogleProfile } from "app/types/GoogleProfile";
import { User } from "app/types/User";
import { clsx, type ClassValue } from "clsx";
import { Authenticator } from 'remix-auth';
import { OAuth2Strategy } from "remix-auth-oauth2";
import { twMerge } from "tailwind-merge";
import { sessionStorage } from "./session";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
const google_client_id = process.env.GOOGLE_CLIENT_ID
const google_client_secret = process.env.GOOGLE_CLIENT_SECRET
const remix_url = process.env.REMIX_URL

export const authenticator = new Authenticator<User>(sessionStorage)


const mapUserFromGoogleProfile = (googleProfile: GoogleProfile): User => {
  console.log("mapper", googleProfile)
  return {
    id: googleProfile.sub,
    name: googleProfile.name,
    email: googleProfile.email,
    picture: googleProfile.picture,
    token: googleProfile.token
  }
}

authenticator.use(
  new OAuth2Strategy<User, GoogleProfile>({
    clientId: google_client_id!,
    clientSecret: google_client_secret!,
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    scopes,
    redirectURI: `${remix_url}/auth/google/callback`,
    tokenRevocationEndpoint: "https://oauth2.googleapis.com/revoke",
    authenticateWith: "request_body"
  }, async ({ tokens }) => {
    console.log("tokens", tokens)
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    })
    const userResponse = await userInfoResponse.json();
    console.log("userResponse", userResponse)
    const user = mapUserFromGoogleProfile({...userResponse, token: tokens.id_token});
    console.log("user", user)
    return user;
  }), "google"
);

