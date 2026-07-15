// lib/models/Post.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

// FAQ Item interface
export interface IFAQItem {
  question: string;
  answer: string;
}

export interface IPost extends Omit<Document, 'schema'> {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  category?: mongoose.Types.ObjectId[];

  status: 'draft' | 'published';
  author: mongoose.Types.ObjectId;

  // FAQ Repeater Field - Array of question/answer pairs
  faq_items?: IFAQItem[];

  // Fully flexible ACF-style fields — add anything, anytime, no code change
  additionalFields: Record<string, any>;

  // JSON-LD Schema - Array of schema objects
  schema?: Array<Record<string, any>> | null;

  publishedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const FAQItemSchema = new Schema<IFAQItem>(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  { _id: false } // Don't create _id for subdocuments
);

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    featuredImage: {
      type: String,
      default: null,
    },
    category: {
      type: [Schema.Types.ObjectId],
      ref: 'Category',
      default: [],
    },

    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // FAQ Repeater Field
    faq_items: {
      type: [FAQItemSchema],
      default: [],
    },

    additionalFields: {
      type: Schema.Types.Mixed,
      default: {},
    },

    schema: {
      type: Schema.Types.Mixed,
      default: null,
    },

    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt auto-managed
  }
);

// Only index we need
PostSchema.index({ slug: 1 }, { unique: true });
PostSchema.index({ status: 1 });
PostSchema.index({ author: 1 });
PostSchema.index({ category: 1 }); // Index for category queries

const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;