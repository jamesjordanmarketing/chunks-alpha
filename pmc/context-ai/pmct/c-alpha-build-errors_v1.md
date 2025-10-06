11:00:36.615 Running build in Washington, D.C., USA (East) – iad1
11:00:36.615 Build machine configuration: 2 cores, 8 GB
11:00:36.632 Cloning github.com/jamesjordanmarketing/chunks-alpha (Branch: main, Commit: 4e14d75)
11:00:37.862 Cloning completed: 1.230s
11:00:38.219 Restored build cache from previous deployment (AobqjhHsfskEYo4FgvictxFjqv5B)
11:00:38.918 Running "vercel build"
11:00:39.315 Vercel CLI 48.2.0
11:00:39.692 Running "install" command: `npm install`...
11:00:41.600 
11:00:41.601 up to date, audited 556 packages in 2s
11:00:41.602 
11:00:41.603 161 packages are looking for funding
11:00:41.603   run `npm fund` for details
11:00:41.603 
11:00:41.604 found 0 vulnerabilities
11:00:41.634 Detected Next.js version: 14.2.33
11:00:41.635 Running "npm run build"
11:00:41.748 
11:00:41.748 > cat-module@0.1.0 build
11:00:41.751 > next build
11:00:41.751 
11:00:42.432   ▲ Next.js 14.2.33
11:00:42.433 
11:00:42.491    Creating an optimized production build ...
11:00:50.476 
11:00:50.476 [1m[33mwarn[39m[22m - Your `content` configuration includes a pattern which looks like it's accidentally matching all of `node_modules` and can cause serious performance issues.
11:00:50.476 [1m[33mwarn[39m[22m - Pattern: `./**/*.ts`
11:00:50.476 [1m[33mwarn[39m[22m - See our documentation for recommendations:
11:00:50.476 [1m[33mwarn[39m[22m - https://tailwindcss.com/docs/content-configuration#pattern-recommendations
11:00:58.940  ✓ Compiled successfully
11:00:58.949    Linting and checking validity of types ...
11:01:10.129 Failed to compile.
11:01:10.130 
11:01:10.130 ./lib/dimension-generation/generator.ts:38:49
11:01:10.130 Type error: Argument of type '{ document_id: string; run_name: string; total_chunks: number; total_dimensions: number; total_cost_usd: number; total_duration_ms: number; ai_model: string; status: "running"; created_by: string; }' is not assignable to parameter of type 'Omit<ChunkRun, "id" | "run_id" | "started_at">'.
11:01:10.130   Type '{ document_id: string; run_name: string; total_chunks: number; total_dimensions: number; total_cost_usd: number; total_duration_ms: number; ai_model: string; status: "running"; created_by: string; }' is missing the following properties from type 'Omit<ChunkRun, "id" | "run_id" | "started_at">': completed_at, error_message
11:01:10.130 
11:01:10.131 [0m [90m 36 |[39m[0m
11:01:10.131 [0m [90m 37 |[39m     [90m// Create run[39m[0m
11:01:10.131 [0m[31m[1m>[22m[39m[90m 38 |[39m     [36mconst[39m run [33m=[39m [36mawait[39m chunkRunService[33m.[39mcreateRun({[0m
11:01:10.131 [0m [90m    |[39m                                                 [31m[1m^[22m[39m[0m
11:01:10.131 [0m [90m 39 |[39m       document_id[33m:[39m documentId[33m,[39m[0m
11:01:10.131 [0m [90m 40 |[39m       run_name[33m:[39m [32m`Dimension Generation - ${new Date().toISOString()}`[39m[33m,[39m[0m
11:01:10.131 [0m [90m 41 |[39m       total_chunks[33m:[39m [35m0[39m[33m,[39m[0m
11:01:10.162 Next.js build worker exited with code: 1 and signal: null
11:01:10.216 Error: Command "npm run build" exited with 1