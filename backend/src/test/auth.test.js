import fastify from "../server.js";
import { expect } from "chai";

describe("Prueba de Autenticación", () => {
  before(async () => {
    await fastify.ready();
  });

  after(async () => {
    await fastify.close();
  });

  it("debería autenticar al usuario admin existente y devolver un token", async () => {
    const loginResponse = await fastify.inject({
      method: "POST",
      url: "/api/login",
      payload: {
        dni: "10101010X",
        password: "admin1234",
      },
    });

    expect(loginResponse.statusCode).to.equal(200);
    const { token } = JSON.parse(loginResponse.payload);

    const protectedResponse = await fastify.inject({
      method: "GET",
      url: "/api/users",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(protectedResponse.statusCode).to.equal(200);
  });
});
