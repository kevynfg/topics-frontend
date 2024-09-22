import { createCookieSessionStorage, Session } from "@remix-run/node";

const session_secret = process.env.SESSION_SECRET;

if (!session_secret) {
  throw new Error("No SESSION_SECRET provided");
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secure: false,
    secrets: [session_secret!]
  }
})

export const getSession = (request: Request) => {
  return sessionStorage.getSession(request.headers.get('Cookie'));
};

export const commitSession = (session: Session) => {
  return sessionStorage.commitSession(session);
};

export const destroySession = (session: Session) => {
  return sessionStorage.destroySession(session);
};