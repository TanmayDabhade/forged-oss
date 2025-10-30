// Re-export authOptions from the NextAuth API route so files importing
// '@/lib/authOptions' can find the symbol.
export { authOptions } from "../app/api/auth/[...nextauth]/route";
