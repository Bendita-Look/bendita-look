namespace apps.dflc.benditalook.entities;

type OrderStatus : String(20) enum {
    New       = 'NEW';
    InService = 'IN_SERVICE';
    Completed = 'COMPLETED';
    Cancelled = 'CANCELLED';
}
