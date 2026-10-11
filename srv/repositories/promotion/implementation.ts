import cds from '@sap/cds';
import { PromotionModel } from '@/models/promotion';
import { PromotionRepository } from './protocols';
import { BaseRepositoryImplementation } from '../base/implementation';

export class PromotionRepositoryImplementation extends BaseRepositoryImplementation<PromotionModel> implements PromotionRepository {

    public async findActive(): Promise<PromotionModel[]> {

        const oRows = await cds.run(SELECT.from(this.getEntity()).where({ Active: true }));

        return this.mapResult(oRows);

    }


    public async findByCouponCode(CouponCode: string): Promise<PromotionModel | null> {

        const oRows = await cds.run(SELECT.from(this.getEntity()).where`upper(CouponCode) = ${CouponCode.toUpperCase()}`);

        return this.mapResult(oRows)[0] ?? null;

    }


    public async countByCouponCode(CouponCode: string, ExcludedId: string): Promise<number> {

        const oResult = await cds.run(
            SELECT.one.from(this.getEntity())
                .columns('count(1) as total')
                .where`upper(CouponCode) = ${CouponCode.toUpperCase()} and ID != ${ExcludedId}`
        );

        return Number(oResult?.total ?? 0);

    }


    public async consumeCoupon(Id: string): Promise<boolean> {

        const iAffectedRows = await cds.run(
            UPDATE(this.getEntity())
                .set({ UsedCount: { '+=': 1 } })
                .where`ID = ${Id} and (MaxUses is null or UsedCount < MaxUses)`
        );

        return iAffectedRows > 0;

    }


    public async releaseCoupon(Id: string): Promise<void> {

        await cds.run(
            UPDATE(this.getEntity())
                .set({ UsedCount: { '-=': 1 } })
                .where({ ID: Id, UsedCount: { '>': 0 } })
        );

    }


    protected entityName(): string {

        return 'Promotions';

    }


    protected mapResult(Rows: any[]): PromotionModel[] {

        return PromotionModel.mapModel(Rows);

    }

}
