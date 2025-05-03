import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

type Users = {
    id: number;
    nama: string;
    contact: string;
};

const filePath = path.join(process.cwd(), 'data', 'users.json');

function readData(): Users[] {
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(jsonData);
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const data = readData();
    const user = data.find(u => u.id === Number(params.id))
    if (!user) return NextResponse.json({ message: "User Not Found" }, { status: 404 })
    return NextResponse.json(user);
}

