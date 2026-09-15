import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await prisma.bidang.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch bidang:', error);
    return NextResponse.json({ error: 'Failed to fetch bidang' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await prisma.bidang.create({
      data: {
        nama: body.nama,
        singkatan: body.singkatan || null
      }
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Failed to create bidang:', error);
    return NextResponse.json({ error: 'Failed to create bidang' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    const updated = await prisma.bidang.update({
      where: { id: body.id },
      data: {
        nama: body.nama,
        singkatan: body.singkatan || null
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update bidang:', error);
    return NextResponse.json({ error: 'Failed to update bidang' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    await prisma.bidang.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete bidang:', error);
    return NextResponse.json({ error: 'Failed to delete bidang' }, { status: 500 });
  }
}
