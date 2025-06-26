import { NextResponse } from "next/server"

// Mock database - same as register
const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
  },
]

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Find user
    const user = users.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Generate mock JWT token
    const token = `mock-jwt-${user.id}-${Date.now()}`

    // INTENTIONAL FLAW: Returning sensitive data including password
    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password, // Should not return password
      },
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
