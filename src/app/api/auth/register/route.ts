import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createUser, getUserByEmail } from "@/lib/user-db";

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1).max(64).optional(),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid registration payload." },
      { status: 400 },
    );
  }

  const { email, name, password } = parsed.data;

  if (getUserByEmail(email)) {
    return NextResponse.json(
      { error: "This email is already registered." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = createUser({
    email,
    name,
    passwordHash,
  });

  return NextResponse.json(
    {
      user: {
        email: user?.email,
        id: user?.id,
        name: user?.name,
      },
    },
    { status: 201 },
  );
}
