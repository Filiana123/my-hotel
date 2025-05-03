import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

type Rooms = {
    id: number;
    type: string;
    price: number;
    isAvailable: boolean;
};


const filePath = path.join(process.cwd(), 'data', 'rooms.json');

function readData(): Rooms[] {
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(jsonData);
}

function writeData(data: Rooms[]) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const data = readData();
    const user = data.find(u => u.id === Number(params.id))
    if (!user) return NextResponse.json({ message: "Room Not Found" }, { status: 404 })
    return NextResponse.json(user);
}

export async function PUT(req: NextRequest,
    { params }: { params: { id: string } }) {
    const body = await req.json();
    const data = readData();
    const index = data.findIndex(u => u.id === Number(params.id));
    if (index === -1) return NextResponse.json({ message: 'Room not found' }, { status: 404 });

    data[index] = { ...data[index], ...body };
    writeData(data);

    return NextResponse.json(data[index]);
}