import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Mengambil daftar permohonan perubahan bidang pegawai (status: PENDING / ALL)
export async function GET() {
  try {
    const usersWithPendingBidang = await prisma.user.findMany({
      where: {
        pendingBidangId: { not: null }
      },
      include: {
        bidangRef: true,
        pendingBidangRef: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    const formatted = usersWithPendingBidang.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phoneNumber: u.phoneNumber || '-',
      currentBidang: u.bidangRef?.nama || u.bidang || 'Belum Ditentukan',
      currentBidangSingkatan: u.bidangRef?.singkatan || null,
      currentBidangId: u.bidangId || null,
      targetBidang: u.pendingBidangRef?.nama || 'Belum Ditentukan',
      targetBidangSingkatan: u.pendingBidangRef?.singkatan || null,
      targetBidangId: u.pendingBidangId || null,
      role: u.role,
      updatedAt: u.updatedAt
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch pending bidang changes:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data permohonan perubahan bidang.' },
      { status: 500 }
    );
  }
}

// PUT: Menyetujui (APPROVE) atau Menolak (REJECT) perubahan bidang
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, action } = body; // action: 'APPROVE' | 'REJECT'

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID dan action (APPROVE / REJECT) wajib disertakan.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { pendingBidangRef: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    if (action === 'APPROVE') {
      const targetBidangId = user.pendingBidangId;
      let targetBidangName = user.pendingBidangRef?.nama || null;

      if (targetBidangId && !targetBidangName) {
        const b = await prisma.bidang.findUnique({ where: { id: targetBidangId } });
        if (b) targetBidangName = b.nama;
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          bidangId: targetBidangId,
          bidang: targetBidangName,
          pendingBidangId: null
        }
      });

      return NextResponse.json({
        success: true,
        message: `Perubahan bidang untuk ${user.name} berhasil disetujui (Approved).`
      });
    } else if (action === 'REJECT') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          pendingBidangId: null
        }
      });

      return NextResponse.json({
        success: true,
        message: `Permintaan perubahan bidang untuk ${user.name} telah ditolak (Rejected).`
      });
    } else {
      return NextResponse.json({ error: 'Action tidak valid.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Failed to handle bidang approval:', error);
    return NextResponse.json(
      { error: 'Gagal memproses persetujuan perubahan bidang.' },
      { status: 500 }
    );
  }
}
