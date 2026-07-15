import mongoose , {Schema, Model, Document} from "mongoose";

export interface ContactPage extends Document {
    metaTitle: string;
    metaDescription: string;
    content: Record<string, any>;
}

const ContactPageSchema = new Schema<ContactPage>(
    {
        metaTitle: {type: String}, 
        metaDescription: {type: String},
        content: {type: Schema.Types.Mixed, default: {}}
    },
    {timestamps: true}
)

const ContactPageModel: Model<ContactPage> = mongoose.models.ContactPage || mongoose.model<ContactPage>("ContactPage", ContactPageSchema);

export default ContactPageModel;