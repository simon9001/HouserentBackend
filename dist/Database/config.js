import { createClient } from "@supabase/supabase-js";
import { env, validateEnv } from "./envConfig.js";
// Validate environment variables on startup
validateEnv();
if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    throw new Error("Missing Supabase credentials in environment variables.");
}
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    auth: {
        persistSession: false,
    },
});
export default supabase;
//# sourceMappingURL=config.js.map