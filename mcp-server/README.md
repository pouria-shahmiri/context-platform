# Local MCP Server for Pyramid Solver

This server connects your local IDE (Trae, VSCode, Claude) to your **live Supabase data** directly from your machine.

## 1. Setup Credentials (REQUIRED)

This server needs permission to access your database. You need your Supabase URL and Service Key (Role: `service_role`).

1. Go to your Supabase Project Settings > API.
2. Find **Project URL**.
3. Find **Project API keys** > `service_role` (secret).

Create a `.env` file in this directory (`/mcp-server/.env`) or pass them directly in the MCP config.

## 2. Configure Trae / Claude Desktop

You need to tell your IDE where to find this server.

**For Claude Desktop:**
Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows).

**For Trae:**
Edit your MCP settings file (typically found in Settings > MCP).

Add this configuration (replace values with your actual keys):

```json
{
  "mcpServers": {
    "pyramid-local": {
      "command": "node",
      "args": [
        "/home/pouria/projects/pyramid-solver/mcp-server/build/index.js"
      ],
      "env": {
        "SUPABASE_URL": "your_supabase_project_url",
        "SUPABASE_SERVICE_KEY": "your_supabase_service_role_key"
      }
    }
  }
}
```

## 3. Build & Use

1. Run `npm install` in this directory.
2. Run `npm run build` to compile the TypeScript code.
3. Restart Trae or Claude.
4. The server `pyramid-local` should now be active.
5. Ask questions like:
   - "List my pyramids"
   - "Get details for pyramid ID..."

## Troubleshooting

- **"Module not found"**: Run `npm install` in this directory.
- **"Updates"**: If you change the code in `src/`, run `npm run build` to update the server.
