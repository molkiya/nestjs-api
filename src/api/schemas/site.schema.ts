import {Document} from 'mongoose';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {SiteStatus} from '../../utils/status.utils';
import {SiteTitle} from '../../utils/title.utils';

export type CachedSiteDocument = CachedSite & Document;

@Schema({_id: false})
class NestedSite {
  @Prop({type: Number})
  id: number;

  @Prop({type: String})
  fqdn: string;

  @Prop({type: Number})
  created_by: number;

  @Prop({type: String})
  created_at: string;

  @Prop({type: String, enum: SiteStatus})
  status: SiteStatus;

  @Prop({type: String, enum: SiteTitle})
  title: SiteTitle;

  @Prop({type: Number})
  ttl: number;

  @Prop({type: String})
  path: string;
}

@Schema({_id: false})
class NestedRaw {
  @Prop({type: String})
  type: string;

  @Prop({type: [Number]})
  data: number[];
}

@Schema({_id: false})
class NestedWhois {
  @Prop({type: Number})
  id: number;

  @Prop({type: Number})
  site_id: number;

  @Prop({type: String})
  ts: string;

  @Prop({type: NestedRaw})
  raw: NestedRaw;
}

@Schema({
  capped: {
    size: 5242880,
    autoIndexId: true,
  },
})
export class CachedSite {
  @Prop({type: NestedSite})
  site: NestedSite;

  @Prop({type: NestedWhois})
  whois: NestedWhois;
}

export const CachedSiteSchema = SchemaFactory.createForClass(CachedSite);
