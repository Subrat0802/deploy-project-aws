import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function dbConnected() {
    try{
        await prisma.$connect();
        console.log("Db connected successfully");
    }catch(error){
        console.log("Error while connecting to db", error);
        process.exit(1);
    }
}