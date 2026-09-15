import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export async function GET() {
  try {
    const data = await db.suratPengantar.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch Surat Pengantar:', error);
    return NextResponse.json({ error: 'Failed to fetch Surat Pengantar' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await db.suratPengantar.create({
      data: {
        tahun: body.tahun || new Date().getFullYear().toString(),
        tanggalDibuat: body.tanggalDibuat || null,
        noLHP: body.noLHP || null,
        noSP: body.noSP || null,
        tujuan: body.tujuan || '',
        linkDrive: body.linkDrive || null
      }
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Failed to create Surat Pengantar:', error);
    return NextResponse.json({ error: 'Failed to create Surat Pengantar' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    const updated = await db.suratPengantar.update({
      where: { id: body.id },
      data: {
        tahun: body.tahun,
        tanggalDibuat: body.tanggalDibuat,
        noLHP: body.noLHP,
        noSP: body.noSP,
        tujuan: body.tujuan,
        linkDrive: body.linkDrive
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update Surat Pengantar:', error);
    return NextResponse.json({ error: 'Failed to update Surat Pengantar' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    await db.suratPengantar.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete Surat Pengantar:', error);
    return NextResponse.json({ error: 'Failed to delete Surat Pengantar' }, { status: 500 });
  }
}
