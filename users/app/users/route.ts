import { NextResponse } from "next/server";
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

function writeData(data: Users[]) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
export async function GET(
) {
    const data: Users[] = readData();
    return NextResponse.json(data);
}


export async function POST(req: Request) {
    const body = await req.json();
    const data: Users[] = readData();

    const newUser = {
        id: Date.now(), // simple unique ID
        ...body,
    };

    data.push(newUser);
    writeData(data);
    return NextResponse.json(newUser, { status: 201 });
}