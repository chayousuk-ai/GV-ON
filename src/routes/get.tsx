import { createFileRoute } from "@tanstack/react-router";
import { PackButtons } from "@/components/operator/pack-buttons";
import { PACKS } from "@/lib/packs";

export const Route = createFileRoute("/get")({ component: GetPacks });

function GetPacks() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-5 py-10">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-mute">GV-ON</p>
        <h1 className="mt-2 text-2xl font-medium">파일 받기</h1>
        <p className="mt-2 text-sm text-mute">
          미리보기 안 클릭이 막히면 이 버튼을 누르세요. Node 24로 설치하면 됩니다.
        </p>
      </div>
      <PackButtons />
      <ul className="space-y-2 text-sm">
        {PACKS.map((p) => (
          <li key={p.id}>
            <a className="underline" href={p.href} target="_blank" rel="noreferrer" download={p.name}>
              {p.name} 직접 열기
            </a>
          </li>
        ))}
      </ul>
      <p className="text-xs text-mute">압축 풀고 설치.bat · Grok CLI는 GROK-CLI.md</p>
    </main>
  );
}
