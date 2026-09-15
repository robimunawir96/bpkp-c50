import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const data = await prisma.suratTugas.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch surat tugas:', error);
    return NextResponse.json({ error: 'Failed to fetch surat tugas' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await prisma.suratTugas.create({
      data: {
        tahun: body.tahun || new Date().getFullYear().toString(),
        noS: body.noS || null,
        noST: body.noST || null,
        tujuan: body.tujuan || '',
        perihal: body.perihal || '',
        tanggalSurat: body.tanggalSurat || null,
        tglMulai: body.tglMulai || null,
        tglSelesai: body.tglSelesai || null,
        suratDiterimaSekretaris: body.suratDiterimaSekretaris || null,
        linkDrive: body.linkDrive || null
      }
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Failed to create surat tugas:', error);
    return NextResponse.json({ error: 'Failed to create surat tugas' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    const updated = await prisma.suratTugas.update({
      where: { id: body.id },
      data: {
        tahun: body.tahun,
        noS: body.noS,
        noST: body.noST,
        tujuan: body.tujuan,
        perihal: body.perihal,
        tanggalSurat: body.tanggalSurat,
        tglMulai: body.tglMulai,
        tglSelesai: body.tglSelesai,
        suratDiterimaSekretaris: body.suratDiterimaSekretaris,
        linkDrive: body.linkDrive
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update surat tugas:', error);
    return NextResponse.json({ error: 'Failed to update surat tugas' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    await prisma.suratTugas.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete surat tugas:', error);
    return NextResponse.json({ error: 'Failed to delete surat tugas' }, { status: 500 });
  }
}
