import { NextResponse } from 'next/server';
import { getTransactions, saveTransactions } from '@/lib/data';

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const transactions = getTransactions();
        const index = transactions.findIndex(t => t.id === parseInt(id));

        if (index === -1) {
            return NextResponse.json({ error: '거래를 찾을 수 없습니다' }, { status: 404 });
        }

        transactions[index] = {
            ...transactions[index],
            date: body.date || transactions[index].date,
            type: body.type || transactions[index].type,
            category: body.category || transactions[index].category,
            description: body.description || transactions[index].description,
            amount: body.amount ? parseInt(body.amount) : transactions[index].amount,
            memberId: body.memberId !== undefined ? body.memberId : transactions[index].memberId,
        };

        saveTransactions(transactions);
        return NextResponse.json({ transaction: transactions[index] });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        let transactions = getTransactions();
        const index = transactions.findIndex(t => t.id === parseInt(id));

        if (index === -1) {
            return NextResponse.json({ error: '거래를 찾을 수 없습니다' }, { status: 404 });
        }

        transactions = transactions.filter(t => t.id !== parseInt(id));
        saveTransactions(transactions);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
