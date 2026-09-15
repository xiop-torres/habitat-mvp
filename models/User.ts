import mongoose, { Schema } from 'mongoose'

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['tenant', 'owner', 'admin'], default: 'tenant' },
}, { timestamps: true })

UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { passwordHash: _passwordHash, ...publicUser } = ret
    return publicUser
  },
})

export default mongoose.models.User || mongoose.model('User', UserSchema)
