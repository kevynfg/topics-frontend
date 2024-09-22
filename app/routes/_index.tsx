import { type MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { Button } from "app/components/ui/button";
import { ButtonWithIcon } from "app/components/ui/loginGoogle";
import Wrapper from "app/components/ui/wrapper";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const navigate = useNavigate();

  const redirectFirstSteps = () => {
    return navigate("/first-steps");
  }

  return (
    <Wrapper>
      <div className="flex h-screen items-center justify-center flex-col gap-8">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">Welcome to Topics!</h1>
        <div className="items-center justify-center">
          <Button className="" onClick={redirectFirstSteps}>Start a Topic</Button>
          <ButtonWithIcon/>
        </div>
      </div>
    </Wrapper>
  );
}

