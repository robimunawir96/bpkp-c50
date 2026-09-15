import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Mengambil daftar registrasi user dengan filter status (default: PENDING atau semua)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'

    const whereClause: any = {};
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        bidangRef: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phoneNumber: u.phoneNumber || '-',
      bidang: u.bidangRef?.nama || u.bidang || '-',
      bidangSingkatan: u.bidangRef?.singkatan || null,
      bidangId: u.bidangId || '',
      role: u.role,
      status: (u as any).status || 'APPROVED',
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch user registrations for approval:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data pendaftaran pengguna.' },
      { status: 500 }
    );
  }
}

// PUT: Menyetujui (APPROVED) atau Menolak (REJECTED) pendaftaran akun
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status, role, bidangId } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID Pengguna dan Status persetujuan wajib disertakan.' },
        { status: 400 }
      );
    }

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json(
        { error: 'Status harus bernilai APPROVED, REJECTED, atau PENDING.' },
        { status: 400 }
      );
    }

    let updateData: any = {
      status
    };

    if (role && ['ADMIN', 'PEGAWAI'].includes(role)) {
      updateData.role = role;
    }

    if (bidangId) {
      updateData.bidangId = bidangId;
      const foundBidang = await prisma.bidang.findUnique({ where: { id: bidangId } });
      if (foundBidang) {
        updateData.bidang = foundBidang.nama;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        bidangRef: true
      }
    });

    return NextResponse.json({
      success: true,
      message:
        status === 'APPROVED'
          ? 'Pendaftaran akun berhasil disetujui (Approved).'
          : 'Pendaftaran akun berhasil ditolak (Rejected).',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        bidang: updatedUser.bidangRef?.nama || updatedUser.bidang || '-',
        role: updatedUser.role,
        status: (updatedUser as any).status
      }
    });
  } catch (error) {
    console.error('Failed to update registration approval status:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui status persetujuan pendaftaran akun.' },
      { status: 500 }
    );
  }
}
