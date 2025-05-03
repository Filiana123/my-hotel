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

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('user');
    const roomId = searchParams.get('room');

    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const data: Booking[] = JSON.parse(jsonData);

    let filteredData = data;
    if (userId) {
        filteredData = filteredData.filter(b => b.user === Number(userId));
    }
    if (roomId) {
        filteredData = filteredData.filter(b => b.room === Number(roomId));
    }

    const [usersRes, roomsRes] = await Promise.all([
        fetch('http://localhost:3000/users'),
        fetch('http://localhost:3000/rooms'),
    ]);
    const [users, rooms] = await Promise.all([
        usersRes.json(),
        roomsRes.json(),
    ]);

    const result = filteredData.map(booking => {
        const userDetail = users.find((u: any) => u.id === booking.user);
        const roomDetail = rooms.find((r: any) => r.id === booking.room);

        const { user, room, ...rest } = booking;

        return {
            ...rest,
            user: userDetail ? { name: userDetail.nama, contact: userDetail.contact } : null,
            room: roomDetail ? { no: roomDetail.id, type: roomDetail.type } : null,
        };
    });

    return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const data: Booking[] = readData();

    const roomId = body.room;
    const userId = body.user;
    if (!roomId || !userId) {
        return NextResponse.json({ message: "Room and User is required" }, { status: 400 });
    }
    const res = await fetch(`http://localhost:3000/rooms/${roomId}`)

    if (!res.ok) {
        return NextResponse.json({ message: "Failed to fetch room data" }, { status: 500 });
    }

    const roomData = await res.json();
    if (!roomData.isAvailable) {
        return NextResponse.json({ message: "Room is not available" }, { status: 404 });
    }
    await fetch(`http://localhost:3000/rooms/${roomId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAvailable: false }),
    });
    const harga = roomData.harga;

    const newBooking = {
        id: Date.now() / 1000,
        ...body,
        check_in: getTodayFormatted(),
        check_out: "",
        price: harga,
    };

    data.push(newBooking);
    writeData(data);

    return NextResponse.json(newBooking, { status: 201 });
}
