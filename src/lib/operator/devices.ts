export type DeviceFamily = "pc" | "tablet" | "mobile";

export type DevicePreset = {
  id: string;
  family: DeviceFamily;
  label: string;
  w: number;
  h: number;
  dpr: number;
  touch: boolean;
  ua: string;
  chUa: string;
  chMobile: "?0" | "?1";
  chPlatform: string;
};

const CHROME = "144.0.0.0";

export const DEVICES: DevicePreset[] = [
  {
    id: "pc-1440",
    family: "pc",
    label: "PC 1440×900",
    w: 1440,
    h: 900,
    dpr: 1,
    touch: false,
    ua: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROME} Safari/537.36`,
    chUa: `"Google Chrome";v="144", "Chromium";v="144", "Not.A/Brand";v="24"`,
    chMobile: "?0",
    chPlatform: `"Windows"`,
  },
  {
    id: "pc-1920",
    family: "pc",
    label: "PC 1920×1080",
    w: 1920,
    h: 1080,
    dpr: 1,
    touch: false,
    ua: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROME} Safari/537.36`,
    chUa: `"Google Chrome";v="144", "Chromium";v="144", "Not.A/Brand";v="24"`,
    chMobile: "?0",
    chPlatform: `"Windows"`,
  },
  {
    id: "tab-768",
    family: "tablet",
    label: "태블릿 768×1024",
    w: 768,
    h: 1024,
    dpr: 2,
    touch: true,
    ua: `Mozilla/5.0 (Linux; Android 15; Pixel Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROME} Safari/537.36`,
    chUa: `"Google Chrome";v="144", "Chromium";v="144", "Not.A/Brand";v="24"`,
    chMobile: "?0",
    chPlatform: `"Android"`,
  },
  {
    id: "tab-1024",
    family: "tablet",
    label: "태블릿 1024×768",
    w: 1024,
    h: 768,
    dpr: 2,
    touch: true,
    ua: `Mozilla/5.0 (Linux; Android 15; Pixel Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROME} Safari/537.36`,
    chUa: `"Google Chrome";v="144", "Chromium";v="144", "Not.A/Brand";v="24"`,
    chMobile: "?0",
    chPlatform: `"Android"`,
  },
  {
    id: "mob-390",
    family: "mobile",
    label: "모바일 390×844",
    w: 390,
    h: 844,
    dpr: 3,
    touch: true,
    ua: `Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROME} Mobile Safari/537.36`,
    chUa: `"Google Chrome";v="144", "Chromium";v="144", "Not.A/Brand";v="24"`,
    chMobile: "?1",
    chPlatform: `"Android"`,
  },
  {
    id: "mob-360",
    family: "mobile",
    label: "모바일 360×800",
    w: 360,
    h: 800,
    dpr: 3,
    touch: true,
    ua: `Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROME} Mobile Safari/537.36`,
    chUa: `"Google Chrome";v="144", "Chromium";v="144", "Not.A/Brand";v="24"`,
    chMobile: "?1",
    chPlatform: `"Android"`,
  },
];

export const DEFAULT_DEVICE = DEVICES[0];

export function deviceById(id: string) {
  return DEVICES.find((d) => d.id === id) ?? DEFAULT_DEVICE;
}
