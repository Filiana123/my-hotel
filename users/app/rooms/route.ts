import { NextResponse } from "next/server";
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

export async function GET(
) {
    const data: Rooms[] = readData();
    return NextResponse.json(data);
}

