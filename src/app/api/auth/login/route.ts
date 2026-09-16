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
      where: { email },
      include: { bidangRef: true }
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

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        bidang: user.bidangRef?.nama || user.bidang || '',
        bidangSingkatan: user.bidangRef?.singkatan || null,
        bidangId: user.bidangId || '',
        role: user.role,
        status: userStatus
      }
    });
  } catch (error: any) {
    console.error('Login failed:', error);
    const errorMessage = process.env.NODE_ENV === 'development' && error?.message
      ? `Terjadi kesalahan pada server: ${error.message}`
      : 'Terjadi kesalahan pada server saat login.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
