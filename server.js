const express = require('express');

// --- Tool Definitions (Based on MCP Spec & WeChat APIs) ---

const WECHAT_TOOLS = [
    {
        "toolSpec": {
            "name": "wechat_upload_material",
            "description": "Uploads a permanent material (image, thumb, voice, video) to WeChat Official Account.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "material_type": {
                        "type": "string",
                        "description": "Type of the material.",
                        "enum": ["image", "thumb", "voice", "video"]
                    },
                    "file_path": {
                        "type": "string",
                        "description": "Local path to the media file to upload (Note: Deployment requires handling file uploads differently)."
                    },
                    // Optional: for video type
                    "title": {
                         "type": "string",
                         "description": "Title for the video material (required for video type)."
                    },
                    "introduction": {
                         "type": "string",
                         "description": "Introduction for the video material (required for video type)."
                    }
                },
                "required": ["material_type", "file_path"]
            }
        }
    },
    {
        "toolSpec": {
            "name": "wechat_publish_article",
            "description": "Publishes a draft article to WeChat Official Account.",
             "inputSchema": {
                "type": "object",
                "properties": {
                    "title": { "type": "string", "description": "Article title." },
                    "author": { "type": "string", "description": "Article author." },
                    "content_html": { "type": "string", "description": "Article content in HTML format." },
                    "cover_image_path": { "type": "string", "description": "Path/URL to the cover image (Needs adjustment for deployment)." },
                    "show_cover_in_body": { "type": "boolean", "description": "Whether to show the cover image in the article body (default: false).", "default": false },
                    "content_source_url": { "type": "string", "description": "URL for 'Read Original Article' link (optional)." }
                 },
                "required": ["title", "content_html", "cover_image_path"]
            }
        }
    }
    // Add more WeChat tools here
];

// --- MCP Server Logic ---

// Create the Express app instance
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Basic root endpoint
app.get('/', (req, res) => {
    res.send('WeChat MCP Server is running.');
});

// MCP Endpoint
app.post('/mcp', (req, res) => {
    console.log("Received MCP request:", JSON.stringify(req.body, null, 2));

    const { mcp_version, action, data } = req.body;

    if (mcp_version !== '2025-03-26') {
         console.warn(`Received request with unsupported MCP version: ${mcp_version}`);
    }

    switch (action) {
        case 'describe':
            res.json({
                mcp_version: "2025-03-26",
                server: {
                    name: "wechat-mcp-server-vercel", // Updated name slightly
                    version: "0.1.0",
                    description: "Server bridging MCP to WeChat APIs, deployed on Vercel.",
                },
                tools: WECHAT_TOOLS
            });
            break;

        case 'call_tool':
            const { tool_name, input } = data;
            console.log(`Attempting to call tool: ${tool_name}`);

            const toolDefinition = WECHAT_TOOLS.find(t => t.toolSpec.name === tool_name);

            if (!toolDefinition) {
                console.error(`Tool not found: ${tool_name}`);
                return res.status(404).json({
                    mcp_version: "2025-03-26",
                    status: "error",
                    error: {
                        code: "tool_not_found",
                        message: `Tool '${tool_name}' is not available on this server.`
                    }
                });
            }

            // --- Placeholder for Actual WeChat API Call ---
            // IMPORTANT: Implement actual WeChat API calls here.
            // Use environment variables for API keys/secrets.
            // Handle file uploads appropriately (e.g., client uploads to Vercel Blob or another storage, then passes URL).
            console.log(`Simulating call to tool '${tool_name}' with input:`, input);

            if (tool_name === 'wechat_upload_material') {
                 const simulatedMediaId = `simulated_media_id_${Date.now()}`;
                 const simulatedUrl = `http://simulated.wechat.com/media?id=${simulatedMediaId}`;
                 res.json({
                     mcp_version: "2025-03-26",
                     status: "success",
                     tool_result: { media_id: simulatedMediaId, url: simulatedUrl }
                 });
            }
            else if (tool_name === 'wechat_publish_article') {
                 const simulatedPublishId = `simulated_publish_id_${Date.now()}`;
                 res.json({
                     mcp_version: "2025-03-26",
                     status: "success",
                     tool_result: { status: "submitted", publish_id: simulatedPublishId }
                 });
            } else {
                 res.json({
                     mcp_version: "2025-03-26",
                     status: "success",
                     tool_result: { message: `Successfully simulated call to ${tool_name}` }
                 });
            }
            // --- End Placeholder ---
            break;

        default:
            console.error(`Unknown MCP action: ${action}`);
            res.status(400).json({
                mcp_version: "2025-03-26",
                status: "error",
                error: {
                    code: "invalid_action",
                    message: `Unknown action '${action}'. Valid actions are 'describe', 'call_tool'.`
                }
            });
    }
});

// Export the app instance for Vercel
module.exports = app; 