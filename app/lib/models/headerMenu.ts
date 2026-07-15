// import mongoose, { Document, Model, Schema } from "mongoose";

// // Sub-sub-child menu item interface
// export interface ISubSubChildMenuItem {
//   sub_sub_child_title: string;
//   sub_sub_child_url: string;
// }

// // Sub-child menu item interface
// export interface ISubChildMenuItem {
//   title: string;
//   url: string;
//   sub_sub_child_menu: ISubSubChildMenuItem[] | false | null;
// }

// // Child menu item interface
// export interface IChildMenuItem {
//   title: string;
//   url: string;
//   sub_child_menu: ISubChildMenuItem[] | false | null;
// }

// // Main menu item interface
// export interface IMainMenuItem {
//   title: string;
//   url: string;
//   child_menu: IChildMenuItem[] | false | null;
// }

// // Header Menu interface
// export interface IHeaderMenu extends Document {
//   main_menu: IMainMenuItem[];
//   createdAt: Date;
//   updatedAt: Date;
// }

// const SubSubChildMenuItemSchema = new Schema<ISubSubChildMenuItem>({
//   sub_sub_child_title: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   sub_sub_child_url: {
//     type: String,
//     required: true,
//     trim: true,
//   },
// }, { _id: false });

// const SubChildMenuItemSchema = new Schema<ISubChildMenuItem>({
//   title: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   url: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   sub_sub_child_menu: {
//     type: [SubSubChildMenuItemSchema],
//     default: null,
//   },
// }, { _id: false });

// const ChildMenuItemSchema = new Schema<IChildMenuItem>({
//   title: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   url: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   sub_child_menu: {
//     type: [SubChildMenuItemSchema],
//     default: null,
//   },
// }, { _id: false });

// const MainMenuItemSchema = new Schema<IMainMenuItem>({
//   title: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   url: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   child_menu: {
//     type: [ChildMenuItemSchema],
//     default: null,
//   },
// }, { _id: false });

// const HeaderMenuSchema = new Schema<IHeaderMenu>(
//   {
//     main_menu: {
//       type: [MainMenuItemSchema],
//       default: [],
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Transform function to convert null to false when reading
// HeaderMenuSchema.set('toJSON', {
//   transform: function(doc, ret) {
//     const transformNested = (menu: any): any => {
//       if (!menu) return menu;
      
//       if (Array.isArray(menu)) {
//         return menu.map(item => {
//           const transformed: any = { ...item };
          
//           if ('child_menu' in transformed) {
//             transformed.child_menu = transformed.child_menu === null ? false : 
//               (Array.isArray(transformed.child_menu) ? transformNested(transformed.child_menu) : transformed.child_menu);
//           }
          
//           if ('sub_child_menu' in transformed) {
//             transformed.sub_child_menu = transformed.sub_child_menu === null ? false :
//               (Array.isArray(transformed.sub_child_menu) ? transformNested(transformed.sub_child_menu) : transformed.sub_child_menu);
//           }
          
//           if ('sub_sub_child_menu' in transformed) {
//             transformed.sub_sub_child_menu = transformed.sub_sub_child_menu === null ? false : transformed.sub_sub_child_menu;
//           }
          
//           return transformed;
//         });
//       }
      
//       return menu;
//     };
    
//     if (ret.main_menu) {
//       ret.main_menu = transformNested(ret.main_menu);
//     }
    
//     return ret;
//   }
// });

// const HeaderMenu: Model<IHeaderMenu> =
//   mongoose.models.HeaderMenu || mongoose.model<IHeaderMenu>("HeaderMenu", HeaderMenuSchema);

// export default HeaderMenu;
import mongoose, { Document, Model, Schema } from "mongoose";

// Header Menu interface - store as pure JSON
export interface IHeaderMenu extends Document {
  main_menu: any; // Pure JSON structure - no validation overhead
  createdAt: Date;
  updatedAt: Date;
}

const HeaderMenuSchema = new Schema<IHeaderMenu>(
  {
    main_menu: {
      type: Schema.Types.Mixed, // Store as pure JSON - no nested validation
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
if (mongoose.models.HeaderMenu) {
  delete mongoose.models.HeaderMenu;
}

const HeaderMenu: Model<IHeaderMenu> = mongoose.model<IHeaderMenu>("HeaderMenu", HeaderMenuSchema);

export default HeaderMenu;