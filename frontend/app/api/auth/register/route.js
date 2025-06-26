import { NextResponse } from "next/server"

// Mock database - in real app this would be a proper database
const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    password: "password123", // In real app, this would be hashed
  },
]

export async function POST(request) {
  try {
    const { name, email, password } = await request.json()

    // Check if user already exists
    const existingUser = users.find((user) => user.email === email)
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password, // INTENTIONAL FLAW: Password not hashed
    }

    users.push(newUser)

    // Generate mock JWT token (in real app, use proper JWT)
    const token = `mock-jwt-${newUser.id}-${Date.now()}`

    // INTENTIONAL FLAW: Returning sensitive data
    return NextResponse.json({
      message: "User created successfully",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        password: newUser.password, // Should not return password
      },
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
