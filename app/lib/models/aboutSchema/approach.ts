

import mongoose, { Model, Schema, Document } from "mongoose";

interface ApproachCards{
  cardTitle: string;
  cardDescription: string;
}
export interface ApproachSection extends Document {
  approachBadgeTitle: string;
  approachHeading: string;
  approachDescription: string;
  approachCards: ApproachCards[];
}

export const ApproachSchema: Schema<ApproachSection> = new Schema({
  approachBadgeTitle: {
    type: String,
    required: true,
  },
  approachHeading: {
    type: String,
    required: true,
  },
  approachDescription: {
    type: String,
    required: true,
  },
  approachCards: {
    type: [
      {
        cardTitle: {
          type: String,
          required: true,
          trim: true,
        },
        cardDescription: {
          type: String,
          required: true,
        },
      },
    ],
    required: true,
  },
},{_id:false});



// const ApproachModel: Model<ApproachSection> =
//   mongoose.models.ApproachSection ||
//   mongoose.model<ApproachSection>("Approach", ApproachSchema);
// export default ApproachModel;
