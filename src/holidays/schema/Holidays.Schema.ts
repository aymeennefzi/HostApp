// holiday.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Holiday extends Document {
  @Prop()
  name: string;

  @Prop()
  date: string;

  @Prop()
  description: string;

  @Prop()
  numberOfDays: number ;

}

export const HolidaySchema = SchemaFactory.createForClass(Holiday);
