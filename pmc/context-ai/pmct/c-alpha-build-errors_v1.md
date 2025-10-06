Failed to parse response for template content_analysis_v1: SyntaxError: Unexpected token '`', "```json
{
"... is not valid JSON
    at JSON.parse (<anonymous>)
    at o.executePromptTemplate (/var/task/src/.next/server/app/api/chunks/extract/route.js:58:6183)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async o.generateDimensionsForChunk (/var/task/src/.next/server/app/api/chunks/extract/route.js:58:5302)
    at async Promise.all (index 0)
    at async o.generateDimensionsForDocument (/var/task/src/.next/server/app/api/chunks/extract/route.js:58:4295)
    at async x (/var/task/src/.next/server/app/api/chunks/extract/route.js:58:2319)
    at async /var/task/src/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38411
    at async e_.execute (/var/task/src/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27880)
    at async e_.handle (/var/task/src/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:39943)