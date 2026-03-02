'use client';

import { useTranslations } from 'next-intl';

type CorrectionFactor = {
  id: string;
  number: string;
  location: string;
  pollens: string[];
  dateRange: string;
};

const data: CorrectionFactor[] = [
  {
    id: '1',
    number: '0012',
    location: 'Marktheidenfeld',
    pollens: ['Eibe (Taxus)', 'Grass'],
    dateRange: 'Nov 25 - Dic 4, 2025',
  },
  {
    id: '2',
    number: '0017',
    location: 'Marktheidenfeld',
    pollens: ['Grass'],
    dateRange: 'Nov 1 - Dic 25, 2025',
  },
];

export default function CorrectionFactorsPage() {
  const t = useTranslations('correctionFactorsPage');
  return (
    <div className="">
      <div className="bg-[#f5f6f8] min-h-full  mx-auto p-3">
        <p className="text-sm text-gray-600 mb-4">{t('description')}</p>

        <div className="flex gap-3 items-center  flex-wrap px-3 ">
          <input
            placeholder={t('filter.placeholderNumber')}
            className="h-9 px-3 border rounded-md text-sm w-40 bg-white"
          />

          <select className="h-9 px-3 border rounded-md text-sm bg-white">
            <option>{t('filter.pollenType')}</option>
          </select>

          <select className="h-9 px-3 border rounded-md text-sm bg-white">
            <option>{t('filter.station')}</option>
          </select>

          <select className="h-9 px-3 border rounded-md text-sm bg-white">
            <option>{t('filter.status')}</option>
          </select>

          <button className="h-9 px-4 text-sm bg-blue-600 text-white rounded-md">
            {t('filter.reset')}
          </button>
        </div>
      </div>

      <div className="space-y-4 px-20 py-6">
        {data.map((item) => (
          <div
            key={item.id}
            className="

              border border-[#E0E2E6]
              rounded-lg
              px-5
              py-4
              flex
              justify-between
              items-start
            "
          >
            <div>
              <h3 className="font-semibold text-sm mb-2">
                {t('card.title', { number: item.number })}
              </h3>

              <div className="text-sm text-gray-700 space-y-1">
                <div>
                  <span className="font-medium">{t('card.location')}</span>{' '}
                  <span className="bg-gray-500 text-white text-xs px-2 py-0.5 rounded">
                    {item.location}
                  </span>
                </div>

                <div>
                  <span className="font-medium">{t('card.pollens')}</span>{' '}
                  {item.pollens.map((p) => (
                    <span
                      key={p}
                      className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded mr-1"
                    >
                      {p}
                    </span>
                  ))}
                </div>

                <div>
                  <span className="font-medium">{t('card.dateRange')}</span>{' '}
                  {item.dateRange}
                </div>
              </div>
            </div>

            <button className="text-sm text-purple-600 hover:underline">
              {t('card.edit')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
