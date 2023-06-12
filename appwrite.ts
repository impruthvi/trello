import { Client, Account, ID, Databases, Storage } from "appwrite";

const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1") // Your API Endpoint
  .setProject(process.env.NEXT_PUBLIC_PROJECT_ID!); // Your project ID

const account = new Account(client);
const database = new Databases(client);
const storage = new Storage(client);

export { client, account, database, storage, ID };
