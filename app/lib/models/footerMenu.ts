import mongoose, { Document, Model, Schema } from "mongoose";

// Footer Menu interface - store as pure JSON
export interface IFooterMenu extends Document {
  main_menu: any; // Pure JSON structure - no validation overhead
  contact_details: any; // Flexible structure with title, url, image, sub_child, etc.
  createdAt: Date;
  updatedAt: Date;
}

const FooterMenuSchema = new Schema<IFooterMenu>(
  {
    main_menu: {
      type: Schema.Types.Mixed, // Store as pure JSON - no nested validation
      default: [],
    },
    contact_details: {
      type: Schema.Types.Mixed, // Flexible structure - supports title, url, image, sub_child, etc.
      default: [],
    },
  },
  {
    timestamps: true,
    // Disable validation for Mixed types
    validateBeforeSave: true,
  }
);

// Delete existing model if it exists to avoid schema cache issues
if (mongoose.models.FooterMenu) {
  delete mongoose.models.FooterMenu;
}

const FooterMenu: Model<IFooterMenu> = mongoose.model<IFooterMenu>("FooterMenu", FooterMenuSchema);

export default FooterMenu;