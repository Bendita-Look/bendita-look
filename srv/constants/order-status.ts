export enum OrderStatus {
    New = 'NEW',
    InService = 'IN_SERVICE',
    Completed = 'COMPLETED',
    Cancelled = 'CANCELLED'
}

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.New]: [OrderStatus.InService, OrderStatus.Cancelled],
    [OrderStatus.InService]: [OrderStatus.Completed, OrderStatus.Cancelled],
    [OrderStatus.Completed]: [],
    [OrderStatus.Cancelled]: []
};
