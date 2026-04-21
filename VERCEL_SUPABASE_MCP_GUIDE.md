# Vercel + Supabase MCP Integration Guide

## ✅ Setup Complete

Both MCP servers are now configured in VS Code and ready to use together.

### Configuration Location
- **File:** `.vscode/mcp.json`
- **Vercel MCP:** `https://mcp.vercel.com` (HTTP)
- **Supabase MCP:** `https://mcp.supabase.com/mcp?project_ref=fwixrbiocgtoddevdtcx` (HTTP)

### Installed Skills
- ✅ Supabase Agent Skills (in `.agents/skills/`)
- ✅ Postgres Best Practices

## 🚀 Using Both MCPs Together

### In VS Code Chat (Copilot)
Both MCPs are now available in the chat. You can:

1. **Ask Vercel MCP to:**
   - Deploy the app
   - Check deployment status
   - Manage environment variables
   - View logs
   
2. **Ask Supabase MCP to:**
   - Query the database
   - Manage tables and migrations
   - View project configuration
   - Execute SQL commands

### Combined Workflow Example

**Scenario:** Deploy and verify database connection

```
You: "Deploy the app to Vercel and verify the DATABASE_URL is set correctly in production"

Vercel MCP will:
  ✓ Check current environment variables
  ✓ Trigger deployment to production
  ✓ Verify NEXT_PUBLIC_SUPABASE_URL is set
  ✓ Verify DATABASE_URL is set
  ✓ Confirm deployment URL

Supabase MCP will:
  ✓ Verify the database connection
  ✓ List available tables
  ✓ Confirm schema matches Prisma
```

## 🔐 Authentication

### Vercel MCP
- Uses OAuth with your Vercel account
- Happens automatically on first request
- No additional setup needed

### Supabase MCP
- Requires Personal Access Token for authenticated operations
- Your project is already pre-configured: `fwixrbiocgtoddevdtcx`
- Optional: Add token when prompts appear

## 📋 Your Supabase Project Details

```
Project ID: fwixrbiocgtoddevdtcx
Project URL: https://fwixrbiocgtoddevdtcx.supabase.co
Database URL: postgresql://postgres:[PASSWORD]@db.fwixrbiocgtoddevdtcx.supabase.co:5432/postgres
MCP Endpoint: https://mcp.supabase.com/mcp?project_ref=fwixrbiocgtoddevdtcx
```

## 🎯 Suggested Commands to Try

### Check Vercel Deployment Status
```
"What is the current deployment status of the cumaths project on Vercel?"
```

### Verify Database Connection
```
"Connect to the Supabase database and list all tables"
```

### Deploy & Verify
```
"Deploy cumaths to Vercel and verify DATABASE_URL environment variable is correctly set"
```

### Check Logs
```
"Show recent deployment logs from Vercel for the cumaths project"
```

## ⚙️ MCP Configuration Details

### .vscode/mcp.json
```json
{
  "servers": {
    "vercel": {
      "type": "http",
      "url": "https://mcp.vercel.com"
    },
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=fwixrbiocgtoddevdtcx"
    }
  }
}
```

### Available Tools via MCP

**Vercel MCP Tools:**
- Deploy projects
- List deployments
- Manage environment variables
- View project details
- Check deployment logs
- Manage domains

**Supabase MCP Tools:**
- Execute SQL queries
- Manage tables
- Run migrations
- Create branches
- Manage Edge Functions
- View project configuration

## 📝 Notes

- Both MCPs use HTTP transport (stateless, no long-lived connections)
- They can be used independently or together in the same conversation
- Agent Skills provide best-practice templates for working with Supabase
- All communication is encrypted over HTTPS

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/nitish-nirajs-projects
- Supabase Dashboard: https://fwixrbiocgtoddevdtcx.supabase.co
- VS Code Docs: https://code.visualstudio.com/docs/copilot/chat/mcp-servers
- Supabase MCP Docs: https://supabase.com/docs/guides/getting-started/mcp

## ✨ Next Steps

1. **Update DATABASE_URL Password**
   - Get the actual password from Supabase dashboard
   - Update `.env.local` locally
   - Set in Vercel: `npx vercel env add DATABASE_URL production`

2. **Test Connection**
   - Run: `npm run prisma:migrate`
   - Run: `npm run dev`
   - Verify decks load without errors

3. **Deploy to Production**
   - Run: `npx vercel deploy --prod --yes`
   - Monitor: Check Vercel and Supabase dashboards

4. **Use MCPs in Chat**
   - Try commands above in VS Code Copilot chat
   - Both MCPs will be available and can work together
