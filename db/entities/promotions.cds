namespace apps.dflc.benditalook.entities;

using {
    cuid,
    managed
} from '@sap/cds/common';
using {apps.dflc.benditalook.entities as entities} from './catalog';
using {
    apps.dflc.benditalook.entities.PromotionScope,
    apps.dflc.benditalook.entities.PromotionReward
} from '../types/order-status';

entity Promotions : cuid, managed {
    Name            : String(120)    @mandatory;
    Description     : String(500);
    Active          : Boolean default true;
    StartDate       : Date;
    EndDate         : Date;
    Scope           : PromotionScope default 'ALL';
    Category        : Association to entities.Categories;
    Product         : Association to entities.Products;
    MinQuantity     : Integer default 1;
    MinAmount       : Decimal(15, 2);
    RewardType      : PromotionReward @mandatory;
    RewardValue     : Decimal(15, 2);
    MaxDiscount     : Decimal(15, 2);
    GiftDescription : String(255);
    CouponCode      : String(20);
    MaxUses         : Integer;
    UsedCount       : Integer default 0;
}
