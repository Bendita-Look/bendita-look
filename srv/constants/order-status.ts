export enum OrderStatus {
    New = 'NEW',
    InService = 'IN_SERVICE',
    OutForDelivery = 'OUT_FOR_DELIVERY',
    Completed = 'COMPLETED',
    Cancelled = 'CANCELLED'
}

export enum DeliveryType {
    UberFlash = 'UBER_FLASH',
    LocalCourier = 'LOCAL_COURIER',
    CustomerArranged = 'CUSTOMER_ARRANGED'
}

export const OPEN_ORDER_STATUSES = [OrderStatus.New, OrderStatus.InService, OrderStatus.OutForDelivery];

export const EDITABLE_ORDER_STATUSES = [OrderStatus.New, OrderStatus.InService];

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.New]: [OrderStatus.InService, OrderStatus.Cancelled],
    [OrderStatus.InService]: [OrderStatus.OutForDelivery, OrderStatus.Completed, OrderStatus.Cancelled],
    [OrderStatus.OutForDelivery]: [OrderStatus.Completed, OrderStatus.Cancelled],
    [OrderStatus.Completed]: [],
    [OrderStatus.Cancelled]: []
};

export enum ReturnItemKind {
    Returned = 'RETURNED',
    Replacement = 'REPLACEMENT'
}

export enum OrderChannel {
    Online = 'ONLINE',
    Store = 'STORE'
}

export enum FulfillmentType {
    Delivery = 'DELIVERY',
    Pickup = 'PICKUP'
}
