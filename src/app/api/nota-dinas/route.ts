import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const data = await prisma.notaDinas.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch nota dinas:', error);
    return NextResponse.json({ error: 'Failed to fetch nota dinas' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await prisma.notaDinas.create({
      data: {
        tahun: body.tahun || new Date().getFullYear().toString(),
        noND: body.noND || null,
        yangMeminta: body.yangMeminta || '',
        tanggalND: body.tanggalND || null,
        perihal: body.perihal || null
      }
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Failed to create nota dinas:', error);
    return NextResponse.json({ error: 'Failed to create nota dinas' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    const updated = await prisma.notaDinas.update({
      where: { id: body.id },
      data: {
        tahun: body.tahun,
        noND: body.noND,
        yangMeminta: body.yangMeminta,
        tanggalND: body.tanggalND,
        perihal: body.perihal
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update nota dinas:', error);
    return NextResponse.json({ error: 'Failed to update nota dinas' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    await prisma.notaDinas.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete nota dinas:', error);
    return NextResponse.json({ error: 'Failed to delete nota dinas' }, { status: 500 });
  }
}
