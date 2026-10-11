export enum PromotionScope {
    AllItems = 'ALL',
    Category = 'CATEGORY',
    Product = 'PRODUCT'
}

export enum PromotionReward {
    PercentDiscount = 'PERCENT',
    FixedDiscount = 'FIXED',
    Gift = 'GIFT',
    CheapestFree = 'CHEAPEST_FREE'
}

export enum CouponStatus {
    Applied = 'APPLIED',
    NotFound = 'NOT_FOUND',
    Exhausted = 'EXHAUSTED',
    NotEligible = 'NOT_ELIGIBLE',
    NotBetter = 'NOT_BETTER'
}

export const STORE_TIME_ZONE = 'America/Sao_Paulo';
