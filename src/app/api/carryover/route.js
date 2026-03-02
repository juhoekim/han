import { NextResponse } from 'next/server';
import { getCarryOver } from '@/lib/data';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const year = parseInt(searchParams.get('year'));
        const month = parseInt(searchParams.get('month'));

        if (!year || !month) {
            return NextResponse.json({ error: 'year와 month 파라미터가 필요합니다' }, { status: 400 });
        }

        const carryOver = getCarryOver(year, month);
        return NextResponse.json({ carryOver });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
