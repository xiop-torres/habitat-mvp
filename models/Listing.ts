import mongoose, { Schema } from 'mongoose'

const ListingSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  roomType: { type: String, enum: ['private', 'shared'], required: true },
  bedrooms: { type: Number, min: 0 },
  bathrooms: { type: Number, min: 0 },
  sizeSqm: { type: Number, min: 0 },
  roommates: { current: { type: Number, default: 0 }, capacity: { type: Number, default: 1 } },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'PEN' },
  utilitiesIncluded: {
    electricity: { type: Boolean, default: false }, water: { type: Boolean, default: false },
    internet: { type: Boolean, default: false }, maintenance: { type: Boolean, default: false }, gas: { type: Boolean, default: false },
  },
  deposit: { required: { type: Boolean, default: false }, amount: { type: Number, min: 0 }, notes: String },
  address: { type: String, required: true, trim: true },
  location: { lat: { type: Number, required: true }, lng: { type: Number, required: true } },
  amenities: [{ type: String, trim: true }],
  images: [{ type: String }],
  contact: { phone: String, whatsapp: String, facebook: String, instagram: String },
  availableFrom: Date,
  status: { type: String, enum: ['draft', 'published', 'rented', 'archived'], default: 'published' },
}, { timestamps: true })

ListingSchema.index({ price: 1, roomType: 1, status: 1 })

export default mongoose.models.Listing || mongoose.model('Listing', ListingSchema)