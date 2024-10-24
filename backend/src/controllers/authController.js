import prisma from "../config/prisma.js"
import { comparePassword } from "../utils/pass.js"

export const login = async (req, reply) => {
  const { dni, password } = req.body

  console.log("Received body:", req.body)

  try {
    const user = await prisma.user.findUnique({
      where: { dni },
    })

    if (!user) {
      console.log("User not found for dni:", dni);
      return reply.status(401).send({ error: "Invalid credentials" })
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      console.log("Password is invalid for dni:", dni);
      return reply.status(401).send({ error: "Invalid credentials" })
    }

    const token = await reply.jwtSign(
      { dni: user.dni, role: user.role, name: user.nombre, surname: user.apellidos },
      { expiresIn: "1h" }
    )

    console.log("Successfully authenticated user:", dni)

    return reply.status(200).header('Content-Type', 'application/json').send({ token })

  } catch (error) {
    console.error("Error during login:", error)
    return reply.status(500).send({ error: "Error during login" })
  }
}
