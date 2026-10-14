import cds from '@sap/cds';
import { OrderItemModel } from '@/models/order-item';
import { OrderPromotionModel } from '@/models/order-promotion';
import { ProductImageRepository } from '@/repositories/product-image';
import { PricedLine, PriceQuote } from '@/services/pricing';

export class OrderBuilder {

    constructor(private readonly ImageRepository: ProductImageRepository) { }


    public async coverImages(Lines: PricedLine[]): Promise<Map<string, string>> {

        const aImages = await this.ImageRepository.findByProductIds([...new Set(Lines.map((oLine) => oLine.variant.ProductId))]);

        return new Map(Lines.flatMap((oLine): [string, string][] => {

            const aProductImages = aImages.filter((oImage) => oImage.ProductId === oLine.variant.ProductId);
            const oCover = aProductImages.find((oImage) => oImage.ColorId === oLine.variant.ColorId) ?? aProductImages[0];

            return oCover ? [[oLine.variant.Id, oCover.Id]] : [];

        }));

    }


    public items(OrderId: string, Lines: PricedLine[], Covers: Map<string, string>): OrderItemModel[] {

        return Lines.map((oLine) => OrderItemModel.with({
            Id: cds.utils.uuid(),
            OrderId,
            VariantId: oLine.variant.Id,
            ProductId: oLine.variant.ProductId,
            ImageId: Covers.get(oLine.variant.Id),
            ProductName: oLine.variant.ProductName,
            ColorName: oLine.variant.ColorName,
            Size: oLine.variant.Size,
            Quantity: oLine.quantity,
            UnitPrice: oLine.variant.Price,
            TotalPrice: oLine.total
        }));

    }


    public promotions(OrderId: string, Quote: PriceQuote): OrderPromotionModel[] {

        return Quote.promotions.map((oPriced) => OrderPromotionModel.with({
            Id: cds.utils.uuid(),
            OrderId,
            PromotionId: oPriced.promotion.Id,
            PromotionName: oPriced.promotion.Name,
            RewardType: oPriced.promotion.RewardType,
            DiscountAmount: oPriced.discount,
            GiftDescription: oPriced.promotion.GiftDescription,
            CouponCode: oPriced.promotion.CouponCode
        }));

    }

}
