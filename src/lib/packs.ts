export const PACKS = [
  { id: "windows", href: "/GV-ON-Windows.zip", name: "GV-ON-Windows.zip", label: "윈도우 설치" },
  { id: "source", href: "/GV-ON-source.zip", name: "GV-ON-source.zip", label: "소스 전체" },
] as const;

export type PackId = (typeof PACKS)[number]["id"];

export async function savePack(href: string, name: string) {
  const res = await fetch(href, { cache: "no-store" });
  if (!res.ok) throw new Error(`받기 실패 ${res.status}`);
  const blob = await res.blob();
  const file = blob.type.includes("zip") ? blob : new Blob([blob], { type: "application/zip" });
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}
