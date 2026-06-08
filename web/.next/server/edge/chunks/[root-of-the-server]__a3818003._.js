(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["chunks/[root-of-the-server]__a3818003._.js", {

"[externals]/node:buffer [external] (node:buffer, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}}),
"[project]/db/appwrite/config.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "appwriteConfig": (()=>appwriteConfig)
});
const appwriteConfig = {
    AppwriteKey: process.env.APPWRITE_KEY || "",
    ProjectId: ("TURBOPACK compile-time value", "68481ce7002b4d536a0e") || "",
    EndpointUrl: ("TURBOPACK compile-time value", "https://fra.cloud.appwrite.io/v1") || "",
    DatabaseId: ("TURBOPACK compile-time value", "68484289001df0b0318b") || "",
    usersCollectionId: ("TURBOPACK compile-time value", "684842bf00122a3043a5") || "",
    chatsCollectionId: ("TURBOPACK compile-time value", "6863c059001915d5724a") || "",
    projectsCollectionId: ("TURBOPACK compile-time value", "6862b8110023a536efe6") || "",
    messagesCollectionId: ("TURBOPACK compile-time value", "6863c06a0039f6c37c1f") || "",
    storageBucketId: ("TURBOPACK compile-time value", "69464c52000dd8bff055") || "",
    filesCollectionId: ("TURBOPACK compile-time value", "694a450f0009c1e429cf") || ""
};
const requiredFields = [
    "ProjectId",
    "EndpointUrl",
    "DatabaseId"
];
for (const field of requiredFields){
    if (!appwriteConfig[field]) {
        throw new Error(`Missing required Appwrite configuration: ${field}`);
    }
}
}}),
"[project]/db/appwrite/index.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "createAdminClient": (()=>createAdminClient),
    "createSessionClient": (()=>createSessionClient)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/node-appwrite/dist/index.mjs [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$client$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/node-appwrite/dist/client.mjs [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$services$2f$account$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/node-appwrite/dist/services/account.mjs [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$services$2f$databases$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/node-appwrite/dist/services/databases.mjs [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$services$2f$storage$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/node-appwrite/dist/services/storage.mjs [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$db$2f$appwrite$2f$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/db/appwrite/config.ts [middleware-edge] (ecmascript)");
"use server";
;
;
const createAdminClient = async ()=>{
    const client = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$client$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Client"]().setEndpoint(__TURBOPACK__imported__module__$5b$project$5d2f$db$2f$appwrite$2f$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["appwriteConfig"].EndpointUrl).setProject(__TURBOPACK__imported__module__$5b$project$5d2f$db$2f$appwrite$2f$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["appwriteConfig"].ProjectId).setKey(__TURBOPACK__imported__module__$5b$project$5d2f$db$2f$appwrite$2f$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["appwriteConfig"].AppwriteKey);
    return {
        get account () {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$services$2f$account$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Account"](client);
        },
        get databases () {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$services$2f$databases$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Databases"](client);
        },
        get storage () {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$services$2f$storage$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Storage"](client);
        }
    };
};
const createSessionClient = async (session)=>{
    const client = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$client$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Client"]().setEndpoint(__TURBOPACK__imported__module__$5b$project$5d2f$db$2f$appwrite$2f$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["appwriteConfig"].EndpointUrl).setProject(__TURBOPACK__imported__module__$5b$project$5d2f$db$2f$appwrite$2f$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["appwriteConfig"].ProjectId);
    if (session) {
        client.setSession(session);
    }
    return {
        get account () {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$services$2f$account$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Account"](client);
        },
        get databases () {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$services$2f$databases$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Databases"](client);
        },
        get storage () {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$services$2f$storage$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["Storage"](client);
        }
    };
};
;
}}),
"[project]/middleware.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// middleware.ts
__turbopack_context__.s({
    "config": (()=>config),
    "middleware": (()=>middleware)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$db$2f$appwrite$2f$index$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/db/appwrite/index.ts [middleware-edge] (ecmascript)");
;
;
async function middleware(req) {
    const sessionId = req.cookies.get("session")?.value;
    // console.log('Middleware: sessionId from cookie =', sessionId);
    // If no session cookie, redirect to login
    if (!sessionId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL("/login", req.url));
    }
    // Create Appwrite client and set session
    const { account } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$db$2f$appwrite$2f$index$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["createSessionClient"])(sessionId);
    try {
        await account.get(); // Throws if session is invalid
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    } catch (err) {
        console.log("[middleware] Error validating session:", err);
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL("/login", req.url));
        response.cookies.delete("session");
        return response;
    }
}
const config = {
    matcher: [
        "/dashboard",
        "/project/:path*"
    ]
};
}}),
}]);

//# sourceMappingURL=%5Broot-of-the-server%5D__a3818003._.js.map