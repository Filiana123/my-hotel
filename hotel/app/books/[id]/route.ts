import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

type Booking = {
    id: number;
    user: number;
    room: number;
    check_in: string;
    check_out: string;
    price: number;
};

const filePath = path.join(process.cwd(), 'data', 'bookHistory.json');

function readData(): Booking[] {
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(jsonData);
}

function writeData(data: Booking[]) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getTodayFormatted(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // bulan dimulai dari 0
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export async function PUT(req: NextRequest,
    { params }: { params: { id: string } }) {
    const body = await req.json();
    const roomId = body.room;
    const userId = body.user;

    const data = readData();
    const index = data.findIndex(u => u.id === Number(params.id));
    if (index === -1) return NextResponse.json({ message: 'Booking Number not found' }, { status: 404 });
    if (!roomId || !userId) {
        return NextResponse.json({ message: "Room and User is required" }, { status: 400 });
    }
    const res = await fetch(`http://localhost:3000/rooms/${body.room}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAvailable: true }),
    });

    if (!res.ok) {
        return NextResponse.json({ message: "Failed to fetch room data" }, { status: 500 });
    }

    data[index] = { ...data[index], check_out: getTodayFormatted() };
    writeData(data);

    return NextResponse.json(data[index]);
}