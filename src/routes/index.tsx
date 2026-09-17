import { createFileRoute } from "@tanstack/react-router";
import { TodayRoom } from "@/components/operator/today-room";
import { HarvestRoom } from "@/components/operator/harvest-room";
import { BotsRoom } from "@/components/operator/bots-room";
import { Dock } from "@/components/operator/dock";
import { PackButtons } from "@/components/operator/pack-buttons";
import { HostBar } from "@/components/operator/host-bar";
import { HostRoom } from "@/components/operator/host-room";
import { Viewport } from "@/components/operator/viewport";
import { useEngine } from "@/lib/operator/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const dock = useEngine((s) => s.dock);
  return (
    <main className="mx-auto flex min-h-dvh max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-mute">GV-ON · Operator</p>
          <h1 className="mt-1 text-2xl font-medium tracking-tight sm:text-3xl">오늘 일과 · 숫자는 읽고 돈은 승인</h1>
          <p className="mt-2 max-w-2xl text-sm text-mute">
            브랜드를 섞지 않습니다. 조회는 자동, 입찰·ON/OFF·목표는 사람. 직원은 Titan XP, 판단은 스튜디오.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <PackButtons />
          <HostBar />
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
        {dock === "bots" ? (
          <BotsRoom />
        ) : dock === "brief" ? (
          <TodayRoom />
        ) : dock === "know" ? (
          <HarvestRoom />
        ) : dock === "pc" ? (
          <HostRoom />
        ) : (
          <Viewport />
        )}
        <Dock />
      </div>
    </main>
  );
}
