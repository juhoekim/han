import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

export function readJSON(filename) {
    const filePath = path.join(dataDir, filename);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
}

export function writeJSON(filename, data) {
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function getTransactions() {
    return readJSON('transactions.json').transactions;
}

export function saveTransactions(transactions) {
    writeJSON('transactions.json', { transactions });
}

export function getMembers() {
    return readJSON('members.json').members;
}

export function saveMembers(members) {
    writeJSON('members.json', { members });
}

export function getSettings() {
    return readJSON('settings.json');
}

export function saveSettings(settings) {
    writeJSON('settings.json', settings);
}

export function getNextId(items) {
    if (items.length === 0) return 1;
    return Math.max(...items.map(i => i.id)) + 1;
}

// 특정 월의 이월금 계산
export function getCarryOver(year, month) {
    const settings = getSettings();
    const transactions = getTransactions();

    // settings에 직접 지정된 이월금이 있는지 확인
    const key = `${year}-${String(month).padStart(2, '0')}`;
    if (settings.carryOver && settings.carryOver[key] !== undefined) {
        return settings.carryOver[key];
    }

    // 없으면 이전 달까지의 모든 거래를 계산
    let total = 0;

    // 첫 번째 이월금 찾기
    if (settings.carryOver) {
        const keys = Object.keys(settings.carryOver).sort();
        if (keys.length > 0) {
            total = settings.carryOver[keys[0]];
        }
    }

    // 첫 이월금 이후 ~ 해당 월 이전까지의 거래 합산
    const firstKey = settings.carryOver ? Object.keys(settings.carryOver).sort()[0] : null;

    transactions.forEach(t => {
        const tDate = new Date(t.date);
        const tYear = tDate.getFullYear();
        const tMonth = tDate.getMonth() + 1;
        const tKey = `${tYear}-${String(tMonth).padStart(2, '0')}`;

        if (firstKey && tKey <= firstKey) return;
        if (tKey >= key) return;

        if (t.type === 'income') {
            total += t.amount;
        } else {
            total -= t.amount;
        }
    });

    return total;
}
