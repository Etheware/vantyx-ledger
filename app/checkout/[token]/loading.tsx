
export default function CheckoutLoading() {
  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <div className="mx-auto min-h-[100dvh] max-w-[1600px] px-4 py-4 sm:px-6 sm:py-6">
        <div className="min-h-[calc(100dvh-2rem)] rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-5 sm:min-h-[calc(100dvh-3rem)] sm:p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="h-8 w-24 rounded-full bg-white/10 sm:w-36" />
              <div className="h-3 w-20 rounded-full bg-white/10 sm:w-24" />
            </div>
            <div className="h-10 w-28 rounded-full bg-white/10 sm:w-40" />
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-3 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-white/10" />
                <div className="mx-auto h-3 w-20 rounded-full bg-white/10" />
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-[1.4fr_0.86fr]">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="h-4 w-44 rounded-full bg-white/10" />
              <div className="mt-3 h-3 w-72 rounded-full bg-white/10" />
              <div className="mt-8 space-y-4">
                <div className="h-28 rounded-[18px] bg-white/8" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="h-24 rounded-[18px] bg-white/8" />
                  <div className="h-24 rounded-[18px] bg-white/8" />
                </div>
                <div className="h-24 rounded-[18px] bg-white/8" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-6">
                <div className="h-4 w-36 rounded-full bg-white/10" />
                <div className="mt-6 space-y-4">
                  <div className="h-20 rounded-[18px] bg-white/8" />
                  <div className="h-20 rounded-[18px] bg-white/8" />
                  <div className="h-20 rounded-[18px] bg-white/8" />
                </div>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-6">
                <div className="h-4 w-28 rounded-full bg-white/10" />
                <div className="mt-4 h-3 w-full rounded-full bg-white/10" />
                <div className="mt-3 h-3 w-3/4 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
