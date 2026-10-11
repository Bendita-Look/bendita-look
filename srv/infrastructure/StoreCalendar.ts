import { STORE_TIME_ZONE } from '@/constants/promotions';

export class StoreCalendar {

    public static today(): string {

        return new Intl.DateTimeFormat('en-CA', { timeZone: STORE_TIME_ZONE }).format(new Date());

    }

}
