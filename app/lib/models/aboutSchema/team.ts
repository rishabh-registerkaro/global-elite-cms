import mongoose, { Model, Schema, Document } from "mongoose";

interface TeamMemberCard {
  name: string;
  designation?: string;
  bio?: string;
  location?: string;
  imgUrl: string;
}
export interface TeamSection extends Document {
  teamBadgeTitle: string;
  teamHeading: string;
  teamDescription: string;
  teamMemberCards: TeamMemberCard[];
}

export const TeamSchema: Schema<TeamSection > = new Schema({
  teamBadgeTitle: {
    type: String,
    required: true,
  },
  teamHeading: {
    type: String,
    required: true,
  },
  teamDescription: {
    type: String,
    required: true,
  },
  teamMemberCards: {
    type: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        designation: { type: String },
        bio: { type: String },
        location: { type: String },
        imgUrl: {
          type: String,
        },
      },
    ],
    required: true,
  },
},{_id:false})
