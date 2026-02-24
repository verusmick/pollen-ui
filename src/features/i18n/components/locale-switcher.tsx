'use client';

import { usePathname, useRouter } from "../routing";

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  function changeLocale(locale: string) {
    router.replace(pathname, { locale });
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => changeLocale('en')}>EN</button>
      <button onClick={() => changeLocale('es')}>ES</button>
      <button onClick={() => changeLocale('de')}>DE</button>
      <button onClick={() => changeLocale('fr')}>FR</button>
      <button onClick={() => changeLocale('nl')}>NL</button>
      <button onClick={() => changeLocale('ar')}>AR</button>
    </div>
  );
}
