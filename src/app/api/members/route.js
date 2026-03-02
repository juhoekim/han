import { NextResponse } from 'next/server';
import { getMembers, saveMembers, getNextId } from '@/lib/data';

export async function GET() {
    try {
        const members = getMembers();
        return NextResponse.json({ members });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const members = getMembers();

        const newMember = {
            id: getNextId(members),
            name: body.name,
            role: body.role || '성도',
        };

        members.push(newMember);
        saveMembers(members);

        return NextResponse.json({ member: newMember }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const members = getMembers();
        const index = members.findIndex(m => m.id === parseInt(body.id));

        if (index === -1) {
            return NextResponse.json({ error: '멤버를 찾을 수 없습니다' }, { status: 404 });
        }

        members[index] = {
            ...members[index],
            name: body.name || members[index].name,
            role: body.role || members[index].role,
        };

        saveMembers(members);
        return NextResponse.json({ member: members[index] });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        let members = getMembers();

        members = members.filter(m => m.id !== parseInt(id));
        saveMembers(members);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
