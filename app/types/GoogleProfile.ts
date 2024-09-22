export type GoogleProfile = {
  provider: "google"
  name: {
    givenName?: string
    familyName?: string
  } & string
  give_name: string
  family_name: string
  picture: string
  email: string
  sub?: string
  token: string
}