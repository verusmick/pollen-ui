import dayjs from "dayjs";

export const getDefaultBaseDate = (fallbackDate: string) => {
    const USE_CURRENT_DATE = process.env.NEXT_PUBLIC_USE_CURRENT_DATE === 'true';
    return USE_CURRENT_DATE ? dayjs().format('YYYY-MM-DD') : fallbackDate;
}
