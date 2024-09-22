import { LoaderFunction } from '@remix-run/node';
import { authenticator } from "app/lib/utils";

export const loader: LoaderFunction = async ({ request }) => {
  console.log("callback", request)
  return authenticator.authenticate('google', request, {
    successRedirect: '/first-steps',
    failureRedirect: '/fail',
  });
};
