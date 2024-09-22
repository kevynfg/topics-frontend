import { useNavigate } from "@remix-run/react";
import Wrapper from "app/components/ui/wrapper";

export default function FirstSteps() {
  const navigate = useNavigate();

  const handleStart = () => {
    return navigate("/topics");
  }

  return (
    <Wrapper>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">First steps</h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            <span className="leading-relaxed underline">Topics</span> is a game where you create rooms, choose a topic, and invite friends to compete in a battle of wits. The game is simple, fun, and easy to play. You can play with friends or random opponents. it&apos;s a <span className="leading-relaxed underline">real-time</span> game with a time limit to choose your answer!
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Also, if you decide to login with your google account, you can keep track of your stats and see how you compare to other players.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-2xl lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 text-base font-semibold leading-7 text-white sm:grid-cols-2 md:flex lg:gap-x-10">
            <button onClick={handleStart} className="text-base font-semibold leading-7 text-white hover:underline">Start <span aria-hidden="true">&rarr;</span></button>
          </div>
          {/* <dl className="mt-16 grid grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col-reverse">
              <dt className="text-base leading-7 text-gray-300">Offices worldwide</dt>
              <dd className="text-2xl font-bold leading-9 tracking-tight text-white">12</dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="text-base leading-7 text-gray-300">Full-time colleagues</dt>
              <dd className="text-2xl font-bold leading-9 tracking-tight text-white">300+</dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="text-base leading-7 text-gray-300">Hours per week</dt>
              <dd className="text-2xl font-bold leading-9 tracking-tight text-white">40</dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="text-base leading-7 text-gray-300">Paid time off</dt>
              <dd className="text-2xl font-bold leading-9 tracking-tight text-white">Unlimited</dd>
            </div>
          </dl> */}
        </div>
      </div>
    </Wrapper>
  );
}