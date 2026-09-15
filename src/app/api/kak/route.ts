import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const data = await prisma.kak.findMany({
      include: {
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch KAK:', error);
    return NextResponse.json({ error: 'Failed to fetch KAK' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await prisma.kak.create({
      data: {
        tahun: body.tahun || new Date().getFullYear().toString(),
        tujuan: body.tujuan || '',
        perihal: body.perihal || '',
        diberikanOleh: body.diberikanOleh || null,
        status: body.status || 'Diterima Sekbid',
        linkDrive: body.linkDrive || null,
        statusHistory: {
          create: body.statusHistory
            ? body.statusHistory.map((h: any) => ({
                status: h.status,
                tanggal: h.tanggal || new Date().toLocaleString('id-ID'),
                keterangan: h.keterangan || null,
                diubahOleh: h.diubahOleh || null
              }))
            : [
                {
                  status: body.status || 'Diterima Sekbid',
                  tanggal: new Date().toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }),
                  keterangan: body.diberikanOleh
                    ? `Dokumen KAK diserahkan oleh ${body.diberikanOleh} dan diterima oleh Sekretaris Bidang.`
                    : 'Dokumen KAK diterima oleh Sekretaris Bidang.',
                  diubahOleh: 'Sekbid'
                }
              ]
        }
      },
      include: {
        statusHistory: true
      }
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Failed to create KAK:', error);
    return NextResponse.json({ error: 'Failed to create KAK' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const existing = await prisma.kak.findUnique({
      where: { id: body.id },
      include: { statusHistory: true }
    });

    const isStatusChanged = existing && existing.status !== body.status;

    const updated = await prisma.kak.update({
      where: { id: body.id },
      data: {
        tahun: body.tahun,
        tujuan: body.tujuan,
        perihal: body.perihal,
        diberikanOleh: body.diberikanOleh,
        status: body.status,
        linkDrive: body.linkDrive,
        ...(isStatusChanged
          ? {
              statusHistory: {
                create: {
                  status: body.status,
                  tanggal: new Date().toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }),
                  keterangan: `Status KAK diperbarui menjadi ${body.status}`,
                  diubahOleh: 'Admin'
                }
              }
            }
          : {})
      },
      include: {
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update KAK:', error);
    return NextResponse.json({ error: 'Failed to update KAK' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    await prisma.kak.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete KAK:', error);
    return NextResponse.json({ error: 'Failed to delete KAK' }, { status: 500 });
  }
}
