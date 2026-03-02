import { NextResponse } from 'next/server';
import { getTransactions, saveTransactions, getNextId } from '@/lib/data';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year');
        const month = searchParams.get('month');

        let transactions = getTransactions();

        if (year && month) {
            transactions = transactions.filter(t => {
                const d = new Date(t.date);
                return d.getFullYear() === parseInt(year) && (d.getMonth() + 1) === parseInt(month);
            });
        } else if (year) {
            transactions = transactions.filter(t => {
                const d = new Date(t.date);
                return d.getFullYear() === parseInt(year);
            });
        }

        return NextResponse.json({ transactions });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const transactions = getTransactions();

        const newTransaction = {
            id: getNextId(transactions),
            date: body.date,
            type: body.type,
            category: body.category,
            description: body.description,
            amount: parseInt(body.amount),
            memberId: body.memberId || null,
        };

        transactions.push(newTransaction);
        saveTransactions(transactions);

        return NextResponse.json({ transaction: newTransaction }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
