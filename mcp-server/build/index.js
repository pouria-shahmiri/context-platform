#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError, } from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";
import { appendFileSync } from "fs";
import path from "path";
import dotenv from "dotenv";
// Load environment variables
dotenv.config();
// --- DEBUG LOGGING ---
const LOG_FILE = path.resolve("/tmp/pyramid-mcp-debug.log");
function log(message) {
    try {
        const timestamp = new Date().toISOString();
        appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
    }
    catch (e) {
        // ignore logging errors
    }
}
log("Starting MCP Server...");
log(`Current Working Directory: ${process.cwd()}`);
// 1. Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Prefer service key for server
if (!supabaseUrl || !supabaseKey) {
    log("WARNING: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables. DB operations will fail.");
}
const supabase = createClient(supabaseUrl || "", supabaseKey || "");
log("Supabase Client Initialized.");
// 2. Setup MCP Server
const server = new Server({
    name: "pyramid-solver-local",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// 3. Define Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    log("Received request: list_tools");
    return {
        tools: [
            {
                name: "get_schema_info",
                description: "Get information about the Supabase database schema",
                inputSchema: { type: "object", properties: {} },
            },
            {
                name: "list_pyramids",
                description: "List recent Pyramids created in the app",
                inputSchema: {
                    type: "object",
                    properties: {
                        limit: { type: "number", description: "Max number of results (default 10)" },
                        userId: { type: "string", description: "Filter by User ID" }
                    },
                },
            },
            {
                name: "get_pyramid",
                description: "Get full details of a specific Pyramid, including all blocks",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "string", description: "The Pyramid ID" }
                    },
                    required: ["id"],
                },
            },
            {
                name: "list_product_definitions",
                description: "List Product Definitions",
                inputSchema: {
                    type: "object",
                    properties: {
                        limit: { type: "number", description: "Max number of results (default 10)" }
                    },
                },
            },
            {
                name: "get_product_definition",
                description: "Get full details of a Product Definition",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "string", description: "The Definition ID" }
                    },
                    required: ["id"],
                },
            }
        ],
    };
});
// 4. Implement Tool Logic
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    log(`Received tool call: ${name} with args: ${JSON.stringify(args)}`);
    try {
        if (name === "get_schema_info") {
            const schemaInfo = `
Tables:
- pyramids (id, user_id, title, context, status, blocks, connections, created_at, last_modified)
- product_definitions (id, user_id, title, data, linked_pyramid_id, created_at, last_modified)
- conversations (id, user_id, title, created_at, updated_at)
- messages (id, user_id, role, content, metadata, parent_id, parent_collection, created_at)
        `;
            return { content: [{ type: "text", text: schemaInfo.trim() }] };
        }
        if (name === "list_pyramids") {
            const limit = Number(args?.limit) || 10;
            let query = supabase
                .from('pyramids')
                .select('id, title, status, last_modified')
                .order('last_modified', { ascending: false })
                .limit(limit);
            if (args?.userId) {
                query = query.eq('user_id', String(args.userId));
            }
            const { data, error } = await query;
            if (error)
                throw new Error(error.message);
            log(`Found ${data?.length || 0} pyramids`);
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        if (name === "get_pyramid") {
            const id = String(args?.id);
            const { data, error } = await supabase
                .from('pyramids')
                .select('*')
                .eq('id', id)
                .single();
            if (error)
                throw new Error(error.message);
            if (!data)
                throw new Error("Pyramid not found");
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        if (name === "list_product_definitions") {
            const limit = Number(args?.limit) || 10;
            const { data, error } = await supabase
                .from('product_definitions')
                .select('id, title, last_modified')
                .order('last_modified', { ascending: false })
                .limit(limit);
            if (error)
                throw new Error(error.message);
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        if (name === "get_product_definition") {
            const id = String(args?.id);
            const { data, error } = await supabase
                .from('product_definitions')
                .select('*')
                .eq('id', id)
                .single();
            if (error)
                throw new Error(error.message);
            if (!data)
                throw new Error("Document not found");
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
    }
    catch (error) {
        log(`Error in tool ${name}: ${error.message}`);
        return {
            content: [{ type: "text", text: `Error: ${error.message}` }],
            isError: true,
        };
    }
});
const transport = new StdioServerTransport();
await server.connect(transport);
log("Server connected and ready.");
