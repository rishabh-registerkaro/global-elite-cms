





import mongoose, { Model, Schema, Document } from "mongoose";

export interface FAQ{
    question:string;
    answer:string;
}

export interface FAQS {
  faqHeading: string;
  faqDescription: string;
  faqQuestions: FAQ[];
}

export const FAQSchema: Schema<FAQS> = new Schema({
  faqHeading: {
    type: String,
    required: true,
  },
  faqDescription: {
    type: String,
    required: true,
  },
  faqQuestions: {
    type:[
        {
            question:{
                type:String,
                required:true
            },
            answer:{
                type:String,
                required:true
            }
        }
    ]
  },
},{_id:false});

// export const HeroModel: Model<AboutHero> =
//   mongoose.models.AboutHero || mongoose.model<AboutHero>("AboutHero", HeroSchema);

