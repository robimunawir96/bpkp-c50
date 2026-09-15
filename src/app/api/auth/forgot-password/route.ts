import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, newPassword, reason } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email wajib diisi.' },
        { status: 400 }
      );
    }

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email tersebut tidak ditemukan di sistem data pegawai BPKP.' },
        { status: 404 }
      );
    }

    // Cek apakah sudah ada permohonan pending untuk email ini
    const existingPending = await (prisma as any).passwordResetRequest.findFirst({
      where: {
        userId: user.id,
        status: 'PENDING'
      }
    });

    if (existingPending) {
      return NextResponse.json(
        {
          error: 'Anda sudah memiliki permohonan reset kata sandi yang sedang menunggu persetujuan Administrator.'
        },
        { status: 400 }
      );
    }

    // Buat permohonan reset password baru
    const resetReq = await (prisma as any).passwordResetRequest.create({
      data: {
        userId: user.id,
        email: user.email,
        newPassword: newPassword || null,
        reason: reason || 'Permohonan lupa kata sandi melalui portal',
        status: 'PENDING'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Permohonan reset kata sandi berhasil diajukan. Mohon menunggu persetujuan Administrator.',
      request: {
        id: resetReq.id,
        email: resetReq.email,
        status: resetReq.status,
        createdAt: resetReq.createdAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Password reset request failed:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat mengajukan reset kata sandi.' },
      { status: 500 }
    );
  }
}
