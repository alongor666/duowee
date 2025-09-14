import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const year = String(form.get("year") || "").trim();
    const week = String(form.get("week") || "").trim();
    const file = form.get("file") as File | null;

    if (!file) return new Response("缺少文件", { status: 400 });
    if (!year || !week) return new Response("缺少年份或周序号", { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const destDir = path.join(process.cwd(), "data", `${year}年保单`);
    await fs.mkdir(destDir, { recursive: true });
    const destPath = path.join(destDir, `${year}年保单截至${week}周数据.csv`);
    await fs.writeFile(destPath, buffer);

    return Response.json({ ok: true, path: path.relative(process.cwd(), destPath) });
  } catch (e: any) {
    return new Response(`上传失败: ${e?.message || e}`, { status: 500 });
  }
}

