import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema()
export class Education extends Document {
@Prop()
degree: string;
@Prop()
university: string;
@Prop()
year: string;
}
export const EducationSchema = SchemaFactory.createForClass(Education);
@Schema()
export class CvData extends Document {
@Prop()
nom: string;
@Prop()
job: string;
@Prop()
phone1: string;
@Prop()
Adresse: string;
@Prop()
email: string;
@Prop()
educations: string;
@Prop()
competences: string;
@Prop()
profile: string;
}
export const CvDataSchema = SchemaFactory.createForClass(CvData);