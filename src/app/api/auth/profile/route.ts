import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Mengambil profil user berdasarkan email atau id (via searchParams)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const id = searchParams.get('id');

    if (!email && !id) {
      return NextResponse.json(
        { error: 'Parameter email atau id wajib disertakan.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(id ? [{ id }] : []),
          ...(email ? [{ email }] : [])
        ]
      },
      include: {
        bidangRef: true,
        pendingBidangRef: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      bidang: user.bidangRef?.nama || user.bidang || '',
      bidangSingkatan: user.bidangRef?.singkatan || null,
      bidangId: user.bidangId || '',
      pendingBidangId: user.pendingBidangId || null,
      pendingBidangNama: user.pendingBidangRef?.nama || null,
      pendingBidangSingkatan: user.pendingBidangRef?.singkatan || null,
      role: user.role,
      avatarUrl: user.avatarUrl || '',
      status: (user as any).status || 'APPROVED',
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Failed to get profile:', error);
    return NextResponse.json({ error: 'Gagal mengambil data profil.' }, { status: 500 });
  }
}

// PUT: Memperbarui profil akun & kata sandi
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, email, name, phoneNumber, bidangId, oldPassword, newPassword, avatarUrl } = body;

    if (!id && !email) {
      return NextResponse.json({ error: 'ID atau email pengguna diperlukan.' }, { status: 400 });
    }

    // Cari user terlebih dahulu
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(id ? [{ id }] : []),
          ...(email ? [{ email }] : [])
        ]
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    // Jika ingin mengganti password, validasi kata sandi lama
    let updatePasswordHash: string | undefined = undefined;
    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: 'Kata sandi baru minimal harus 8 karakter.' },
          { status: 400 }
        );
      }

      if (user.passwordHash && user.passwordHash !== oldPassword) {
        return NextResponse.json(
          { error: 'Kata sandi lama yang Anda masukkan tidak sesuai.' },
          { status: 400 }
        );
      }

      updatePasswordHash = newPassword;
    }

    let isBidangChanged = false;
    let pendingBidangPayload: any = {};
    let directBidangPayload: any = {};

    if (bidangId !== undefined) {
      const currentBidangId = user.bidangId || '';
      const requestedBidangId = bidangId || '';

      // Jika user adalah ADMIN, perubahan bidang langsung disetujui & diterapkan
      if (user.role === 'ADMIN') {
        let resolvedBidangName = null;
        if (requestedBidangId) {
          const b = await prisma.bidang.findUnique({ where: { id: requestedBidangId } });
          if (b) resolvedBidangName = b.nama;
        }
        directBidangPayload = {
          bidangId: requestedBidangId || null,
          bidang: resolvedBidangName,
          pendingBidangId: null
        };
      } else if (requestedBidangId !== currentBidangId) {
        // Jika PEGAWAI, set sebagai pendingBidangId menunggu approval admin
        isBidangChanged = true;
        pendingBidangPayload = {
          pendingBidangId: requestedBidangId || null
        };
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name ? { name } : {}),
        ...(phoneNumber !== undefined ? { phoneNumber: phoneNumber || null } : {}),
        ...directBidangPayload,
        ...pendingBidangPayload,
        ...(avatarUrl !== undefined ? { avatarUrl: avatarUrl || null } : {}),
        ...(updatePasswordHash ? { passwordHash: updatePasswordHash } : {})
      },
      include: {
        bidangRef: true,
        pendingBidangRef: true
      }
    });

    const isPendingApproval = Boolean(isBidangChanged && user.role !== 'ADMIN');

    return NextResponse.json({
      success: true,
      message: isPendingApproval
        ? 'Profil berhasil diperbarui. Permintaan perubahan bidang telah dikirim dan menunggu persetujuan Administrator.'
        : 'Profil berhasil diperbarui.',
      isPendingApproval,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber || '',
        bidang: updatedUser.bidangRef?.nama || updatedUser.bidang || '',
        bidangSingkatan: updatedUser.bidangRef?.singkatan || null,
        bidangId: updatedUser.bidangId || '',
        pendingBidangId: updatedUser.pendingBidangId || null,
        pendingBidangNama: updatedUser.pendingBidangRef?.nama || null,
        pendingBidangSingkatan: updatedUser.pendingBidangRef?.singkatan || null,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl || '',
        status: (updatedUser as any).status || 'APPROVED'
      }
    });
  } catch (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: 'Gagal menyimpan perubahan profil.' }, { status: 500 });
  }
}
