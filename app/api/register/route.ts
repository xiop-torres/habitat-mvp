import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json()
    if (!name || !email || !password) return NextResponse.json({ error: 'Completa todos los campos.' }, { status: 400 })
    if (String(password).length < 8) return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 })
    await dbConnect()
    const normalizedEmail = String(email).toLowerCase()
    if (await User.findOne({ email: normalizedEmail })) return NextResponse.json({ error: 'Ese correo ya está registrado.' }, { status: 409 })
    const user = await User.create({ name, email: normalizedEmail, passwordHash: await bcrypt.hash(password, 10), role: role === 'owner' ? 'owner' : 'tenant' })
    return NextResponse.json({ id: user._id, name: user.name, email: user.email }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'No se pudo crear la cuenta.' }, { status: 500 })
  }
}