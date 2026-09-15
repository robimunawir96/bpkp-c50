import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.passwordHash !== password) {
      return NextResponse.json(
        { error: 'Email atau kata sandi yang Anda masukkan salah.' },
        { status: 401 }
      );
    }

    const userStatus = (user as any).status || 'APPROVED';

    if (userStatus === 'PENDING') {
      return NextResponse.json(
        { error: 'Akun Anda sedang menunggu persetujuan (approval) dari Administrator. Silakan hubungi admin.' },
        { status: 403 }
      );
    }

    if (userStatus === 'REJECTED') {
      return NextResponse.json(
        { error: 'Pendaftaran akun Anda ditolak oleh Administrator. Silakan hubungi bagian pengelola BPKP.' },
        { status: 403 }
      );
    }

    const userWithBidang = await prisma.user.findUnique({
      where: { id: user.id },
      include: { bidangRef: true }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        bidang: userWithBidang?.bidangRef?.nama || user.bidang || '',
        bidangSingkatan: userWithBidang?.bidangRef?.singkatan || null,
        bidangId: userWithBidang?.bidangId || '',
        role: user.role,
        status: userStatus
      }
    });
  } catch (error) {
    console.error('Login failed:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat login.' },
      { status: 500 }
    );
  }
}
