import type { Regulator } from '@/lib/types';

export const REGULATORS: Regulator[] = [
  {
    id: 'sama',
    name: { en: 'Saudi Central Bank', ar: 'البنك المركزي السعودي' },
    short: { en: 'SAMA', ar: 'ساما' },
    colour: '#0F2237',
  },
  {
    id: 'cma',
    name: { en: 'Capital Market Authority', ar: 'هيئة السوق المالية' },
    short: { en: 'CMA', ar: 'الهيئة' },
    colour: '#0B6F62',
  },
  {
    id: 'ia',
    name: { en: 'Insurance Authority', ar: 'هيئة التأمين' },
    short: { en: 'IA', ar: 'هيئة التأمين' },
    colour: '#B8892B',
  },
  {
    id: 'sdaia',
    name: { en: 'Saudi Data & AI Authority', ar: 'الهيئة السعودية للبيانات والذكاء الاصطناعي' },
    short: { en: 'SDAIA', ar: 'سدايا' },
    colour: '#2C5C94',
  },
  {
    id: 'nca',
    name: { en: 'National Cybersecurity Authority', ar: 'الهيئة الوطنية للأمن السيبراني' },
    short: { en: 'NCA', ar: 'الهيئة الوطنية' },
    colour: '#6B4E9E',
  },
];

export const regulatorById = (id: string) => REGULATORS.find((r) => r.id === id)!;
