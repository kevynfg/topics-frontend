import { Mail } from "lucide-react";
import { Button } from "./button";

 
export function ButtonWithIcon() {
  return (
    <Button onClick={loginGoogle}>
      <Mail className="mr-2 h-4 w-4" /> Login with Google
    </Button>
  )
}

const loginGoogle = () => {
  window.location.href = '/auth/google';
}