import type { AdType } from "@prisma/client";

/**
 * Запит від біт-адаптера
 * Містить параметри для підбору line item
 */
export type BidRequest = {
    /** Розмір банера, наприклад "300x250" */
    size: string;
    /** Geo таргетинг (країна), наприклад "US", "UA" */
    geo: string;
    /** Тип реклами: banner, video, native */
    adType: AdType;
    /** CPM ставка, яку пропонує біддер */
    bidPrice: number;
    /** IP адреса користувача (для frequency capping) */
    userIp: string;
};

/**
 * Відповідь від AdServer
 * Містить інформацію про вибраний line item
 */
export type BidResponse = {
    /** ID вибраного line item */
    lineItemId: string;
    /** URL креативу для показу */
    creativeUrl: string;
    /** CPM вибраного line item */
    cpm: number;
    /** Розмір креативу */
    size: string;
    /** Тип реклами */
    adType: AdType;
};

/**
 * Line Item з додатковою інформацією про креатив
 * Використовується всередині сервісу
 */
export type LineItemWithCreative = {
    id: string;
    size: string;
    cpmMin: number;
    cpmMax: number;
    geo: string[];
    adType: AdType;
    frequency: number;
    creativeId: string;
    creative: {
        url: string;
    };
};

/**
 * Лог показу реклами для frequency capping
 * Зберігається в MongoDB
 */
export type ImpressionLog = {
    id: string;
    lineItemId: string;
    userIp: string;
    timestamp: Date;
};