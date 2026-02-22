import { NextResponse } from 'next/server';

// This route depends on unimplemented services (calculateSplit, canProcessSplit)
// Stubbed with 410 Gone until the split payment system is fully implemented
export async function POST() {
  return NextResponse.json(
    { error: 'Split payment calculation is not yet available.', code: 'NOT_IMPLEMENTED' },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: 'Split payment calculation is not yet available.', code: 'NOT_IMPLEMENTED' },
    { status: 410 }
  );
}
