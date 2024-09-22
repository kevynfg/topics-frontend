import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "app/lib/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/welcome",
    failureRedirect: "/fail",
  });
}

export default function LoginPage() {
  return (
    <div>
      <h1>Login</h1>
    </div>
  )
}