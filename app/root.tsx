import type { LinksFunction } from "@remix-run/node";
import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from "@remix-run/react";

import { useEffect, useState } from "react";
import { SocketProvider } from "./context";
import { getSession } from "./lib/session";
import { connectToWebSocket } from "./lib/ws.client";
import styles from "./styles/tailwind.css?url";
import { User } from "./types/User";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://rsms.me/inter/inter.css",
  },
  {
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css",
  },
  {
    rel: "stylesheet",
    href: styles,
  }
];

export type LoaderData = {
  ENV: {
    NODE_ENV: string | undefined;
    GOOGLE_CLIENT_ID: string | undefined;
    GOOGLE_CLIENT_SECRET: string | undefined;
    SESSION_SECRET: string | undefined;
    BACKEND_URL: string | undefined;
  },
  user: User | null;
};

export async function loader({ request }) {
  const cookies = await getSession(request);
  let user = null;
  if (cookies.data?.user)
    user = cookies.data.user;
  return json<LoaderData>({
    ENV: {
      NODE_ENV: process.env.NODE_ENV,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      SESSION_SECRET: process.env.SESSION_SECRET,
      BACKEND_URL: process.env.BACKEND_URL
    },
    user
  })
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<LoaderData>();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{
          __html: `window.process = ${JSON.stringify({ env: data.ENV })}`
        }}>
        </script>
        <div className="bg-gray-900">
          <div className="absolute -top-52 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:top-[-28rem] sm:ml-16 sm:translate-x-0 sm:transform-gpu" aria-hidden="true">
            <div className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-[#1f171a] to-[#69696d] opacity-20"></div>
          </div>
          {children}
          <ScrollRestoration />
          <Scripts />
        </div>
      </body>
    </html>
  );
}

export default function App() {
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    const connection = connectToWebSocket();
    setSocket(connection);
    return () => {
      connection.close();
    };
  }, []);

  return (
    <SocketProvider socket={socket}>
    <Outlet />
    </SocketProvider>
  );
}

