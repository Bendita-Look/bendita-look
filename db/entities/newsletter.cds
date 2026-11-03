namespace apps.dflc.benditalook.entities;

using {
    cuid,
    managed
} from '@sap/cds/common';

entity Subscribers : cuid, managed {
    Name         : String(120);
    Email        : String(120) @mandatory;
    Active       : Boolean default true;
    Token        : String(64) @mandatory;
    ConsentAt    : Timestamp;
    UnsubscribedAt : Timestamp;
}

entity NewsletterCampaigns : cuid, managed {
    Subject        : String(160) @mandatory;
    Body           : LargeString;
    Status         : String(20) default 'DRAFT';
    SentAt         : Timestamp;
    RecipientCount : Integer default 0;
    FailureCount   : Integer default 0;
}
