import { PrismaClient } from "@prisma/client";

import { config } from "../config/index.js";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  // eslint-disable-next-line
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (config.isDev) globalThis.prisma = prisma;
