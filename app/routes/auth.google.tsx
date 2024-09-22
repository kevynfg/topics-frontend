import { LoaderFunction } from '@remix-run/node';
import { authenticator } from "app/lib/utils";

export const loader: LoaderFunction = async ({ request }) => {
  console.log("request", request)
  return authenticator.authenticate('google', request);
};
