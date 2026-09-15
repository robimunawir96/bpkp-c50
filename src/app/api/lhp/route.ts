import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bidangId = searchParams.get('bidangId');
    const role = searchParams.get('role');

    const where: any = {};
    if (role && role !== 'ADMIN') {
      if (bidangId && bidangId !== 'none') {
        where.bidangId = bidangId;
      } else {
        where.bidangId = '__NONE__';
      }
    } else if (bidangId && bidangId !== 'ALL') {
      where.bidangId = bidangId;
    }

    const data = await prisma.lhp.findMany({
      where,
      include: { bidang: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch LHP:', error);
    return NextResponse.json({ error: 'Failed to fetch LHP' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await prisma.lhp.create({
      data: {
        tahun: body.tahun || new Date().getFullYear().toString(),
        bidangId: body.bidangId || null,
        noS: body.noS || null,
        noLHP: body.noLHP || null,
        tanggalLHP: body.tanggalLHP || null,
        tujuan: body.tujuan || '',
        perihal: body.perihal || '',
        tanggalDiterimaSekretaris: body.tanggalDiterimaSekretaris || null,
        linkDrive: body.linkDrive || null
      },
      include: { bidang: true }
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Failed to create LHP:', error);
    return NextResponse.json({ error: 'Failed to create LHP' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    const updated = await prisma.lhp.update({
      where: { id: body.id },
      data: {
        tahun: body.tahun,
        bidangId: body.bidangId !== undefined ? body.bidangId || null : undefined,
        noS: body.noS,
        noLHP: body.noLHP,
        tanggalLHP: body.tanggalLHP,
        tujuan: body.tujuan,
        perihal: body.perihal,
        tanggalDiterimaSekretaris: body.tanggalDiterimaSekretaris,
        linkDrive: body.linkDrive
      },
      include: { bidang: true }
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update LHP:', error);
    return NextResponse.json({ error: 'Failed to update LHP' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    await prisma.lhp.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete LHP:', error);
    return NextResponse.json({ error: 'Failed to delete LHP' }, { status: 500 });
  }
}
