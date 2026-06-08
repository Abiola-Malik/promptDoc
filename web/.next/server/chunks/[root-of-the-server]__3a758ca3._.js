module.exports = {

"[project]/.next-internal/server/app/api/projects/[projectId]/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/db/appwrite/config.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
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
"[externals]/node:http [external] (node:http, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:http", () => require("node:http"));

module.exports = mod;
}}),
"[externals]/node:https [external] (node:https, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:https", () => require("node:https"));

module.exports = mod;
}}),
"[externals]/node:zlib [external] (node:zlib, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:zlib", () => require("node:zlib"));

module.exports = mod;
}}),
"[externals]/node:stream [external] (node:stream, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}}),
"[externals]/node:buffer [external] (node:buffer, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}}),
"[externals]/node:util [external] (node:util, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:util", () => require("node:util"));

module.exports = mod;
}}),
"[externals]/node:url [external] (node:url, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:url", () => require("node:url"));

module.exports = mod;
}}),
"[externals]/node:net [external] (node:net, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:net", () => require("node:net"));

module.exports = mod;
}}),
"[externals]/node:fs [external] (node:fs, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}}),
"[externals]/node:path [external] (node:path, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}}),
"[externals]/node:process [external] (node:process, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:process", () => require("node:process"));

module.exports = mod;
}}),
"[externals]/node:stream/web [external] (node:stream/web, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:stream/web", () => require("node:stream/web"));

module.exports = mod;
}}),
"[externals]/buffer [external] (buffer, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}}),
"[externals]/worker_threads [external] (worker_threads, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("worker_threads", () => require("worker_threads"));

module.exports = mod;
}}),
"[externals]/node:assert [external] (node:assert, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:assert", () => require("node:assert"));

module.exports = mod;
}}),
"[externals]/node:querystring [external] (node:querystring, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:querystring", () => require("node:querystring"));

module.exports = mod;
}}),
"[externals]/node:diagnostics_channel [external] (node:diagnostics_channel, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:diagnostics_channel", () => require("node:diagnostics_channel"));

module.exports = mod;
}}),
"[externals]/node:events [external] (node:events, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:events", () => require("node:events"));

module.exports = mod;
}}),
"[externals]/node:tls [external] (node:tls, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:tls", () => require("node:tls"));

module.exports = mod;
}}),
"[externals]/node:perf_hooks [external] (node:perf_hooks, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:perf_hooks", () => require("node:perf_hooks"));

module.exports = mod;
}}),
"[externals]/node:util/types [external] (node:util/types, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:util/types", () => require("node:util/types"));

module.exports = mod;
}}),
"[externals]/node:os [external] (node:os, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:os", () => require("node:os"));

module.exports = mod;
}}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}}),
"[externals]/node:console [external] (node:console, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:console", () => require("node:console"));

module.exports = mod;
}}),
"[externals]/string_decoder [external] (string_decoder, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("string_decoder", () => require("string_decoder"));

module.exports = mod;
}}),
"[externals]/node:worker_threads [external] (node:worker_threads, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:worker_threads", () => require("node:worker_threads"));

module.exports = mod;
}}),
"[externals]/node:crypto [external] (node:crypto, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}}),
"[externals]/node:http2 [external] (node:http2, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:http2", () => require("node:http2"));

module.exports = mod;
}}),
"[project]/db/appwrite/index.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/* __next_internal_action_entry_do_not_use__ [{"7f7229bf05b065bad544039c8dd2f11b2429b47248":"createSessionClient","7f92df8ff8251ec974e9414fc15650d3d1fbae7c7d":"createAdminClient"},"",""] */ __turbopack_context__.s({
    "createAdminClient": (()=>createAdminClient),
    "createSessionClient": (()=>createSessionClient)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/app-render/encryption.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/node-appwrite/dist/index.mjs [app-route] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/node-appwrite/dist/client.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$services$2f$account$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/node-appwrite/dist/services/account.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$services$2f$databases$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/node-appwrite/dist/services/databases.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$services$2f$storage$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/node-appwrite/dist/services/storage.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$db$2f$appwrite$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/db/appwrite/config.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-route] (ecmascript)");
;
;
;
;
const createAdminClient = async ()=>{
    const client = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Client"]().setEndpoint(__TURBOPACK__imported__module__$5b$project$5d2f$db$2f$appwrite$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["appwriteConfig"].EndpointUrl).setProject(__TURBOPACK__imported__module__$5b$project$5d2f$db$2f$appwrite$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["appwriteConfig"].ProjectId).setKey(__TURBOPACK__imported__module__$5b$project$5d2f$db$2f$appwrite$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["appwriteConfig"].AppwriteKey);
    return {
        get account () {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$services$2f$account$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Account"](client);
        },
        get databases () {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$services$2f$databases$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Databases"](client);
        },
        get storage () {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$services$2f$storage$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Storage"](client);
        }
    };
};
const createSessionClient = async (session)=>{
    const client = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Client"]().setEndpoint(__TURBOPACK__imported__module__$5b$project$5d2f$db$2f$appwrite$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["appwriteConfig"].EndpointUrl).setProject(__TURBOPACK__imported__module__$5b$project$5d2f$db$2f$appwrite$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["appwriteConfig"].ProjectId);
    if (session) {
        client.setSession(session);
    }
    return {
        get account () {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$services$2f$account$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Account"](client);
        },
        get databases () {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$services$2f$databases$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Databases"](client);
        },
        get storage () {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$services$2f$storage$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Storage"](client);
        }
    };
};
;
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    createAdminClient,
    createSessionClient
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(createAdminClient, "7f92df8ff8251ec974e9414fc15650d3d1fbae7c7d", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(createSessionClient, "7f7229bf05b065bad544039c8dd2f11b2429b47248", null);
}}),
"[project]/lib/helpers.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/* __next_internal_action_entry_do_not_use__ [{"4094163b3005d46c70e5a1fd5abbe1f5b5e5533193":"sleep","60d62d66aaa21a3e0fc81f18a0fefcd44b6912b9d2":"generateChunkId","7f22c50b70deb8ecaed7f3131db7b24bbd33486c11":"getSession"},"",""] */ __turbopack_context__.s({
    "generateChunkId": (()=>generateChunkId),
    "getSession": (()=>getSession),
    "sleep": (()=>sleep)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/app-render/encryption.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-route] (ecmascript)");
;
;
;
const getSession = async ()=>{
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const session = cookieStore.get("session")?.value;
    if (!session) {
        return {
            success: false,
            status: 401,
            error: "No session"
        };
    }
    return {
        success: true,
        session,
        status: 200
    };
};
async function generateChunkId(projectId, chunk) {
    const { filename, chunkIndex } = chunk.metadata;
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_{2,}/g, "_").slice(0, 50);
    const sanitizedProjectId = projectId.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 32);
    // Return clean string ID
    return `${sanitizedProjectId}-${sanitizedFilename}-${chunkIndex}`;
}
async function sleep(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getSession,
    generateChunkId,
    sleep
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(getSession, "7f22c50b70deb8ecaed7f3131db7b24bbd33486c11", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(generateChunkId, "60d62d66aaa21a3e0fc81f18a0fefcd44b6912b9d2", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(sleep, "4094163b3005d46c70e5a1fd5abbe1f5b5e5533193", null);
}}),
"[project]/app/api/projects/[projectId]/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "GET": (()=>GET)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$db$2f$appwrite$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/db/appwrite/config.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$db$2f$appwrite$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/db/appwrite/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/helpers.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/node-appwrite/dist/index.mjs [app-route] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/node-appwrite/dist/client.mjs [app-route] (ecmascript) <locals>");
;
;
;
;
;
const { DatabaseId, projectsCollectionId } = __TURBOPACK__imported__module__$5b$project$5d2f$db$2f$appwrite$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["appwriteConfig"];
// Cache for 10 seconds, stale-while-revalidate for 60 seconds
const CACHE_MAX_AGE = 10;
const CACHE_STALE_WHILE_REVALIDATE = 60;
async function GET(request, context) {
    const awaitedParams = await context.params;
    const { projectId } = awaitedParams;
    if (!projectId || typeof projectId !== "string") {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Invalid project ID"
        }, {
            status: 400
        });
    }
    try {
        // 1. Validate session
        const sessionResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSession"])();
        if (!sessionResult.session || sessionResult.error) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Unauthorized"
            }, {
                status: 401
            });
        }
        const session = sessionResult.session;
        const { databases, account } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$db$2f$appwrite$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSessionClient"])(session);
        // 2. Validate logged-in user
        let user;
        try {
            user = await account.get();
        } catch (error) {
            console.error("Failed to get user account:", error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid session"
            }, {
                status: 401
            });
        }
        // 3. Fetch project with error handling
        let project;
        try {
            const doc = await databases.getDocument(DatabaseId, projectsCollectionId, projectId);
            project = doc;
        } catch (error) {
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$node$2d$appwrite$2f$dist$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AppwriteException"]) {
                if (error.code === 404) {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        error: "Project not found"
                    }, {
                        status: 404
                    });
                }
                console.error("Appwrite error:", {
                    code: error.code,
                    message: error.message,
                    type: error.type
                });
            }
            // Re-throw unknown/unhandled errors
            throw error;
        }
        // 4. Verify ownership - handle both string and Document types
        const projectUserId = typeof project.userId === "string" ? project.userId : project.userId.$id;
        if (projectUserId !== user.$id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Forbidden: You do not own this project"
            }, {
                status: 403
            });
        }
        // 5. Return project with proper caching headers
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            project
        }, {
            status: 200,
            headers: {
                "Cache-Control": `private, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`
            }
        });
    } catch (error) {
        // Type-safe error logging
        if (error instanceof Error) {
            console.error("[GET /api/projects/[projectId]] Error:", {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
        } else {
            console.error("[GET /api/projects/[projectId]] Unknown Error:", error);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal server error"
        }, {
            status: 500
        });
    }
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__3a758ca3._.js.map