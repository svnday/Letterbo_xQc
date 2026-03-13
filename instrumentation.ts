export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { config } = await import("dotenv");
    const path = await import("path");
    config({ path: path.resolve(process.cwd(), ".env") });
  }
}
