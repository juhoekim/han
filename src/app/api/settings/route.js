import { NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/data';

export async function GET() {
    try {
        const settings = getSettings();
        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const settings = getSettings();

        const updated = { ...settings, ...body };
        saveSettings(updated);

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
