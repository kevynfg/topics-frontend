export default function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen items-center justify-center flex-col gap-8">
      {children}
    </div>
  )
}