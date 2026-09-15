import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, password, bidang, bidangId: inputBidangId } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: 'Nama lengkap, email, dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk.' },
        { status: 400 }
      );
    }

    // Resolusi relasi Bidang ke database
    let resolvedBidangId: string | null = inputBidangId || null;
    let resolvedBidangName: string | null = bidang || null;

    if (resolvedBidangId) {
      const foundBidang = await prisma.bidang.findUnique({
        where: { id: resolvedBidangId }
      });
      if (foundBidang) {
        resolvedBidangName = foundBidang.nama;
      }
    } else if (resolvedBidangName) {
      const foundBidang = await prisma.bidang.findFirst({
        where: {
          nama: {
            equals: resolvedBidangName,
            mode: 'insensitive'
          }
        }
      });
      if (foundBidang) {
        resolvedBidangId = foundBidang.id;
      }
    }

    const newUser = await prisma.user.create({
      data: {
        name: fullName,
        email,
        passwordHash: password, // For production consider hashing with bcrypt
        role: 'PEGAWAI',
        status: 'PENDING' as any,
        bidang: resolvedBidangName,
        bidangId: resolvedBidangId
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        bidang: newUser.bidang,
        role: newUser.role,
        status: (newUser as any).status || 'PENDING'
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Registration failed:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat mendaftarkan akun.' },
      { status: 500 }
    );
  }
}
