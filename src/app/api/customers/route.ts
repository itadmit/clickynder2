import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const business = await prisma.business.findFirst({
      where: {
        ownerUserId: session.user.id,
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    const customers = await prisma.customer.findMany({
      where: {
        businessId: business.id,
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        _count: {
          select: {
            appointments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const business = await prisma.business.findFirst({
      where: {
        ownerUserId: session.user.id,
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, phone, email } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    // Split name into firstName and lastName
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    // Check if customer already exists by phone
    let customer = await prisma.customer.findFirst({
      where: {
        businessId: business.id,
        phone,
      },
    });

    if (customer) {
      // Update existing customer
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          firstName,
          lastName,
          email,
        },
      });
    } else {
      // Create new customer
      customer = await prisma.customer.create({
        data: {
          businessId: business.id,
          firstName,
          lastName,
          phone,
          email,
        },
      });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error creating/updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create/update customer' },
      { status: 500 }
    );
  }
}

