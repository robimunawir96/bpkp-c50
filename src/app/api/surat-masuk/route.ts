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

    const data = await prisma.suratMasuk.findMany({
      where,
      include: {
        bidang: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch Surat Masuk:', error);
    return NextResponse.json({ error: 'Failed to fetch Surat Masuk' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await prisma.suratMasuk.create({
      data: {
        tahun: body.tahun || new Date().getFullYear().toString(),
        noSuratMasuk: body.noSuratMasuk || '',
        tanggalSuratMasuk: body.tanggalSuratMasuk || null,
        instansiPengirim: body.instansiPengirim || '',
        perihal: body.perihal || '',
        tanggalDiterimaSekbid: body.tanggalDiterimaSekbid || null,
        tanggalDikirimKeSekper: body.tanggalDikirimKeSekper || null,
        linkDrive: body.linkDrive || null,
        bidangId: body.bidangId || null
      },
      include: {
        bidang: true
      }
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Failed to create Surat Masuk:', error);
    return NextResponse.json({ error: 'Failed to create Surat Masuk' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updated = await prisma.suratMasuk.update({
      where: { id: body.id },
      data: {
        tahun: body.tahun,
        noSuratMasuk: body.noSuratMasuk,
        tanggalSuratMasuk: body.tanggalSuratMasuk,
        instansiPengirim: body.instansiPengirim,
        perihal: body.perihal,
        tanggalDiterimaSekbid: body.tanggalDiterimaSekbid,
        tanggalDikirimKeSekper: body.tanggalDikirimKeSekper,
        linkDrive: body.linkDrive,
        bidangId: body.bidangId !== undefined ? body.bidangId || null : undefined
      },
      include: {
        bidang: true
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update Surat Masuk:', error);
    return NextResponse.json({ error: 'Failed to update Surat Masuk' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    await prisma.suratMasuk.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete Surat Masuk:', error);
    return NextResponse.json({ error: 'Failed to delete Surat Masuk' }, { status: 500 });
  }
}
