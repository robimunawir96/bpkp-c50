import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Mengambil daftar permohonan reset password
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'

    const whereClause: any = {};
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const resetRequests = await (prisma as any).passwordResetRequest.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            bidang: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = resetRequests.map((r: any) => ({
      id: r.id,
      userId: r.userId,
      userName: r.user?.name || 'Pengguna',
      userEmail: r.user?.email || r.email,
      userBidang: r.user?.bidang || '-',
      userRole: r.user?.role || 'PEGAWAI',
      email: r.email,
      newPassword: r.newPassword || null,
      reason: r.reason || 'Lupa kata sandi',
      status: r.status,
      adminNotes: r.adminNotes || null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch password reset requests:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data permohonan reset kata sandi.' },
      { status: 500 }
    );
  }
}

// PUT: Menyetujui (APPROVED) atau Menolak (REJECTED) reset password
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status, adminNotes, generatedPassword } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID Permohonan dan Status wajib disertakan.' },
        { status: 400 }
      );
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Status harus bernilai APPROVED atau REJECTED.' },
        { status: 400 }
      );
    }

    const resetReq = await (prisma as any).passwordResetRequest.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!resetReq) {
      return NextResponse.json(
        { error: 'Permohonan reset kata sandi tidak ditemukan.' },
        { status: 404 }
      );
    }

    if (status === 'APPROVED') {
      // Terapkan kata sandi baru ke user
      // Gunakan generatedPassword dari admin jika ada, atau newPassword yang diminta user, atau default '12345678'
      const finalPassword = generatedPassword || resetReq.newPassword || '12345678';

      await prisma.user.update({
        where: { id: resetReq.userId },
        data: {
          passwordHash: finalPassword
        }
      });
    }

    // Update status permohonan
    const updatedReq = await (prisma as any).passwordResetRequest.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes || (status === 'APPROVED' ? 'Disetujui oleh Administrator' : 'Ditolak oleh Administrator')
      }
    });

    return NextResponse.json({
      success: true,
      message:
        status === 'APPROVED'
          ? 'Permohonan reset kata sandi berhasil disetujui dan kata sandi baru telah diaktifkan.'
          : 'Permohonan reset kata sandi telah ditolak.',
      request: updatedReq
    });
  } catch (error) {
    console.error('Failed to process password reset approval:', error);
    return NextResponse.json(
      { error: 'Gagal memproses persetujuan reset kata sandi.' },
      { status: 500 }
    );
  }
}
