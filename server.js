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
    const { jsonrpc, id, method, params } = req.body;

    // 检查 JSON-RPC 2.0 协议
    if (jsonrpc !== '2.0' || typeof id === 'undefined' || !method) {
        return res.json({
            jsonrpc: "2.0",
            id: id || null,
            error: {
                code: -32600,
                message: "Invalid Request"
            }
        });
    }

    // 提取工具定义（去掉 toolSpec 外层）
    const tools = WECHAT_TOOLS.map(t => t.toolSpec);

    // 处理 tools.list
    if (method === 'tools.list') {
        return res.json({
            jsonrpc: "2.0",
            id,
            result: {
                tools
            }
        });
    }

    // 处理 tools.call
    if (method === 'tools.call') {
        const { name, arguments: args } = params || {};
        const tool = tools.find(t => t.name === name);

        if (!tool) {
            return res.json({
                jsonrpc: "2.0",
                id,
                error: {
                    code: -32602,
                    message: `Unknown tool: ${name}`
                }
            });
        }

        // 这里只做模拟返回
        if (name === 'wechat_upload_material') {
            return res.json({
                jsonrpc: "2.0",
                id,
                result: {
                    content: [
                        {
                            type: "text",
                            text: `已模拟上传素材: ${args.material_type}, file_path: ${args.file_path}`
                        }
                    ],
                    isError: false
                }
            });
        }
        if (name === 'wechat_publish_article') {
            return res.json({
                jsonrpc: "2.0",
                id,
                result: {
                    content: [
                        {
                            type: "text",
                            text: `已模拟发布文章: ${args.title}`
                        }
                    ],
                    isError: false
                }
            });
        }

        // 兜底
        return res.json({
            jsonrpc: "2.0",
            id,
            result: {
                content: [
                    {
                        type: "text",
                        text: `工具 ${name} 已被调用`
                    }
                ],
                isError: false
            }
        });
    }

    // 未知方法
    return res.json({
        jsonrpc: "2.0",
        id,
        error: {
            code: -32601,
            message: `Method not found: ${method}`
        }
    });
});

// Export the app instance for Vercel
module.exports = app;

// 本地启动监听端口（仅本地开发需要，Vercel 部署不影响）
if (require.main === module) {
  app.listen(3000, () => {
    console.log('WeChat MCP Server is running on port 3000');
  });
} 