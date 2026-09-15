import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        bidangRef: true,
        pendingBidangRef: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format output data user (jangan kembalikan passwordHash secara langsung)
    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phoneNumber: u.phoneNumber || '-',
      bidang: u.bidangRef?.nama || u.bidang || '-',
      bidangSingkatan: u.bidangRef?.singkatan || null,
      bidangId: u.bidangId || '',
      pendingBidangId: u.pendingBidangId || null,
      pendingBidangNama: u.pendingBidangRef?.nama || null,
      pendingBidangSingkatan: u.pendingBidangRef?.singkatan || null,
      role: u.role,
      status: (u as any).status || 'APPROVED',
      avatarUrl: u.avatarUrl,
      createdAt: u.createdAt
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch pegawai:', error);
    return NextResponse.json({ error: 'Failed to fetch pegawai' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phoneNumber, bidangId, bidang, role, status } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Nama dan email wajib diisi.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      return NextResponse.json({ error: 'Email sudah terdaftar.' }, { status: 400 });
    }

    let resolvedBidangName = bidang;
    if (bidangId && !resolvedBidangName) {
      const b = await prisma.bidang.findUnique({ where: { id: bidangId } });
      if (b) resolvedBidangName = b.nama;
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: password || '12345678',
        phoneNumber: phoneNumber || null,
        bidangId: bidangId || null,
        bidang: resolvedBidangName || null,
        role: role === 'ADMIN' ? 'ADMIN' : 'PEGAWAI',
        status: (status || 'APPROVED') as any
      },
      include: {
        bidangRef: true
      }
    });

    return NextResponse.json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber || '-',
      bidang: newUser.bidangRef?.nama || newUser.bidang || '-',
      bidangSingkatan: newUser.bidangRef?.singkatan || null,
      bidangId: newUser.bidangId || '',
      role: newUser.role,
      status: (newUser as any).status || 'APPROVED',
      createdAt: newUser.createdAt
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create pegawai:', error);
    return NextResponse.json({ error: 'Failed to create pegawai' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    let resolvedBidangName = body.bidang;
    if (body.bidangId && !resolvedBidangName) {
      const b = await prisma.bidang.findUnique({ where: { id: body.bidangId } });
      if (b) resolvedBidangName = b.nama;
    }

    const updated = await prisma.user.update({
      where: { id: body.id },
      data: {
        name: body.name,
        email: body.email,
        phoneNumber: body.phoneNumber || null,
        bidangId: body.bidangId || null,
        bidang: resolvedBidangName || null,
        pendingBidangId: null,
        role: body.role === 'ADMIN' ? 'ADMIN' : 'PEGAWAI',
        ...(body.status ? { status: body.status } : {}),
        ...(body.password ? { passwordHash: body.password } : {})
      },
      include: {
        bidangRef: true
      }
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phoneNumber: updated.phoneNumber || '-',
      bidang: updated.bidangRef?.nama || updated.bidang || '-',
      bidangSingkatan: updated.bidangRef?.singkatan || null,
      bidangId: updated.bidangId || '',
      role: updated.role,
      status: (updated as any).status || 'APPROVED',
      createdAt: updated.createdAt
    });
  } catch (error) {
    console.error('Failed to update pegawai:', error);
    return NextResponse.json({ error: 'Failed to update pegawai' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    await prisma.user.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete pegawai:', error);
    return NextResponse.json({ error: 'Failed to delete pegawai' }, { status: 500 });
  }
}
