# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Ultracite Code Standards

This project uses **Ultracite**, a zero-config Biome preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `bun ultracite fix`
- **Check for issues**: `bun ultracite check`
- **Diagnose setup**: `npx ultracite doctor`

Biome (the underlying engine) provides extremely fast Rust-based linting and formatting. Most issues are automatically fixable.

---

## Project Structure

Turborepo monorepo with Bun as runtime:

```
osopit/
├── apps/
│   └── web/              # Next.js 16 app (React 19.2)
│       ├── src/
│       │   ├── app/      # App Router pages
│       │   ├── components/ # React components + shadcn/ui
│       │   ├── hooks/    # Custom React hooks
│       │   ├── lib/      # Utilities, contracts, constants
│       │   ├── gqty/     # Generated GraphQL client (auto-generated, don't edit)
│       │   └── env.ts    # Environment variable validation
├── packages/
│   └── osopit-subgraph/  # The Graph protocol subgraph
│       ├── schema.graphql # GraphQL schema for subgraph
│       ├── subgraph.yaml # Subgraph manifest
│       └── src/          # Event handlers (AssemblyScript)
```

---

## Common Commands

### Development

```bash
bun install              # Install dependencies
bun dev                  # Run all apps in dev mode
bun dev:web              # Run only the web app (https://localhost:3001)
bun build                # Build all apps
```

### Code Quality

```bash
bun typecheck            # TypeScript type checking
bun lint                 # Check code with Ultracite
bun fix                  # Auto-fix safe issues
bun fix:unsafe           # Auto-fix all issues including unsafe ones
bun check                # Run both lint and typecheck
```

### Database (if applicable)

```bash
bun db:push              # Push schema changes
bun db:studio            # Open database studio
bun db:generate          # Generate migrations
bun db:migrate           # Run migrations
bun db:start             # Start database
bun db:stop              # Stop database
bun db:down              # Tear down database
```

### Subgraph Development

```bash
cd packages/osopit-subgraph
bun codegen              # Generate TypeScript types from schema
bun build                # Build subgraph
bun deploy               # Deploy to The Graph Studio
bun deploy-local         # Deploy to local Graph node
bun test                 # Run subgraph tests
```

---

## Architecture Overview

### Web App (`apps/web`)

**Tech Stack:**
- Next.js 16 (App Router) with React 19.2
- TypeScript with strict mode
- TailwindCSS 4 for styling
- shadcn/ui components
- React Query for server state
- Wagmi + Viem for Web3 interactions
- Porto.sh for smart wallet onboarding
- Reown AppKit (WalletConnect) for wallet connections
- GQty for GraphQL client (type-safe)

**Key Features:**
- **Progressive Web App (PWA)** - Installable, offline-capable
- **ENS Subdomains** - Users register subdomains under osopit.eth or catmisha.eth on Base
- **Live Broadcasting** - Users can start/stop broadcasts and track them
- **Smart Wallet Onboarding** - Porto.sh integration for gasless onboarding
- **Artist Profiles** - ENS text records store profile data (avatar, bio, social links, art pieces)
- **Profile Editing** - Update text records on ENS resolver
- **Tipping** - Send tips to artists

**Smart Contracts (Base mainnet):**

The app supports two ENS environments, controlled by `NEXT_PUBLIC_ENS_ENVIRONMENT`:

**osopit.eth (production, default):**
- `L2Registry`: `0x8c77dd23735dbe20c3cae29250bdd3bf80e6f9b1`
- `L2Registrar`: `0xb2576cD3Cfcc023e4A48c79BaF23A8787dc372ff`
- Subgraph: `osopit-subgraphv-1`

**catmisha.eth (dev/testing):**
- `L2Registry`: `0xa609955257eacbbd566a1fa654e6c5f4b1fdc9e2`
- `L2Registrar`: `0x63e7b8F8A8d42b043fe58Be1243d7cBcb1Ca5514`
- Subgraph: `catmisha-subgraph`

**Environment Variables:**
Required in `apps/web/.env`:
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=  # Reown/WalletConnect project ID
PINATA_JWT=                             # Pinata IPFS API key (for image uploads)
MERCHANT_ADDRESS=                       # Smart wallet merchant address
MERCHANT_PRIVATE_KEY=                   # Smart wallet merchant private key
GRAPH_JWT=                              # The Graph API key
NEXT_PUBLIC_ENS_ENVIRONMENT=osopit      # "osopit" or "catmisha" (defaults to "osopit")
```

**Switching ENS Environments:**

To test locally on catmisha.eth without polluting osopit.eth:

1. Set `NEXT_PUBLIC_ENS_ENVIRONMENT=catmisha` in your `.env` file
2. Restart the dev server
3. All ENS operations will use catmisha.eth contracts and subgraph

Configuration files:
- Environment presets: `apps/web/src/lib/ens-environments.ts`
- Domain name: `apps/web/src/lib/constants.ts` (reads from environment)
- Contract addresses: `apps/web/src/lib/contracts.ts` (reads from environment)
- Subgraph URL: `apps/web/src/gqty/index.ts` (reads from environment)

**Custom Hooks Pattern:**
All hooks in `src/hooks/` follow a consistent pattern:
- Named `use-<feature>.ts`
- Return explicit variables (not destructured)
- Use React Query or Wagmi hooks
- Handle loading/error states

Examples:
- `use-artist-profile.ts` - Fetch user profile from subgraph
- `use-register-subdomain.ts` - Register ENS subdomain via contract
- `use-update-text-record.ts` - Update ENS text records
- `use-create-profile.ts` - Generate profile via AI and upload to IPFS
- `use-active-broadcast.ts` - Get current live broadcast for user

**GraphQL Integration:**
- Client generated by GQty in `src/gqty/` (never edit `schema.generated.ts`)
- Queries The Graph subgraph endpoint (switches based on ENS environment)
- Type-safe GraphQL queries with full TypeScript support
- The subgraph URL is dynamically selected in `src/gqty/index.ts` based on `NEXT_PUBLIC_ENS_ENVIRONMENT`
- To regenerate schema: update endpoint in `gqty.config.cjs`, then run codegen

### Subgraph (`packages/osopit-subgraph`)

**Purpose:**
Indexes blockchain events from Base mainnet contracts to provide queryable data about:
- User registrations (ENS subdomains)
- Text record updates (profile changes)
- Live broadcasts (active streams, participants)

**Schema Entities:**
- `User` - Wallet address, subdomain, active broadcast
- `Subdomain` - ENS node, name, owner, text records
- `TextRecord` - Key-value pairs for profile data
- `Broadcast` - Live stream tracking with participants

**Event Handlers:**
- `handleNameRegistered` - New subdomain registration
- `handleTextChanged` - Profile updates and broadcast state changes
- Special handling for "app.osopit.broadcast" key to track live streams

**Deployment:**
- Network: Base mainnet
- Graph Studio project: osopit-subgraphv-1
- Start blocks configured in `subgraph.yaml`

---

## Theming System

The app uses a **two-dimensional theme system** with full type safety and dynamic color palettes.

### Architecture

**Composite Themes:**
- **Mode**: `light` | `dark` (controls brightness)
- **Color**: `midnight` | `sunset` | `ocean` | `forest` (controls color palette)
- **Combined**: `light-midnight`, `dark-midnight`, `light-sunset`, `dark-sunset`, etc.

**Tech Stack:**
- `next-themes` for theme management and persistence
- OKLCH color space for perceptually uniform colors
- TailwindCSS 4 with CSS variables
- Type-safe theme configuration in TypeScript

### Key Files

**Configuration:**
- `src/lib/theme-config.ts` - TypeScript theme definitions, helper functions
- `src/index.css` - CSS variable definitions for all themes (8 themes × 40+ tokens)
- `src/components/providers.tsx` - ThemeProvider setup
- `src/app/layout.tsx` - Global theme switcher placement

**Components:**
- `src/components/theme-switcher.tsx` - Theme picker UI (fixed bottom-right)
- `src/components/color-theme-provider.tsx` - `useColorTheme()` hook

### Using Themes

**In Components:**
```tsx
// Use semantic tokens via Tailwind classes
<div className="bg-background text-foreground">
  <h1 className="text-brand">Heading</h1>
  <button className="bg-brand text-brand-foreground">Click me</button>
  <div className="bg-surface-elevated border-border">Elevated surface</div>
</div>
```

**Available Tokens:**
- **Base**: `background`, `foreground`, `card`, `popover`
- **Semantic**: `primary`, `secondary`, `muted`, `accent`, `destructive`
- **Brand**: `brand`, `brand-secondary` (theme-specific colors)
- **State**: `live`, `success`, `info`, `warning`
- **Surfaces**: `surface-elevated`, `surface-glass`
- **UI**: `border`, `input`, `ring`

**Using the Hook:**
```tsx
import { useColorTheme } from "@/components/color-theme-provider";

function MyComponent() {
  const { mode, color, setMode, setColor } = useColorTheme();

  // mode = "light" | "dark"
  // color = "midnight" | "sunset" | "ocean" | "forest"

  setMode("dark");        // Changes to dark mode, preserves color
  setColor("ocean");      // Changes to ocean, preserves mode
}
```

### Adding a New Color Theme

1. **Add to theme config** (`src/lib/theme-config.ts`):
   ```ts
   export type ThemeColor = "midnight" | "sunset" | "ocean" | "forest" | "yourtheme";

   export const COLOR_THEMES = {
     yourtheme: {
       label: "Your Theme",
       description: "Description of color palette",
       brandHue: 180,    // OKLCH hue for primary brand color
       accentHue: 210,   // OKLCH hue for secondary color
     },
   };
   ```

2. **Define CSS variables** (`src/index.css`):
   ```css
   /* Light Your Theme */
   [data-theme="light-yourtheme"] {
     /* Copy all tokens from light-midnight */
     /* Change only brand colors: */
     --brand: oklch(0.6 0.2 180);           /* Your primary color */
     --brand-secondary: oklch(0.65 0.22 210); /* Your accent color */
   }

   /* Dark Your Theme */
   [data-theme="dark-yourtheme"] {
     /* Copy all tokens from dark-midnight */
     /* Change only brand colors (slightly brighter for dark): */
     --brand: oklch(0.7 0.2 180);
     --brand-secondary: oklch(0.75 0.22 210);
   }
   ```

3. **Update providers** (`src/components/providers.tsx`):
   ```tsx
   themes={[
     "light-midnight",
     "dark-midnight",
     // ... other themes
     "light-yourtheme",
     "dark-yourtheme",
   ]}
   ```

### Color System

**OKLCH Format:**
- `oklch(lightness chroma hue)`
- Lightness: 0-1 (0 = black, 1 = white)
- Chroma: 0-0.4 (saturation/colorfulness)
- Hue: 0-360 (color angle)

**Examples:**
- Purple: `oklch(0.6 0.2 270)`
- Orange: `oklch(0.65 0.2 30)`
- Blue: `oklch(0.6 0.2 230)`
- Green: `oklch(0.6 0.2 145)`

**Benefits:**
- Perceptually uniform (equal changes look equally different)
- Wide color gamut support
- Predictable lightness adjustments

### Theme Switcher

**Location:** Fixed bottom-right corner on all pages

**Features:**
- Mode toggle (Light/Dark) with icons
- Color picker with multi-color preview (brand, brand-secondary, live)
- Persists to localStorage automatically
- Accessible via keyboard

**Customization:**
Preview shows 3 colors per theme. Edit `src/components/theme-switcher.tsx` to change preview colors.

### Best Practices

1. **Always use semantic tokens** - Never hardcode colors
   - ✅ `className="bg-brand text-foreground"`
   - ❌ `className="bg-purple-500 text-white"`

2. **Pair colors with foregrounds** - Ensures readability
   - ✅ `className="bg-brand text-brand-foreground"`
   - ❌ `className="bg-brand text-white"`

3. **Use opacity modifiers** for variations
   - `bg-brand/50` - 50% opacity
   - `border-border/60` - 60% opacity

4. **Test in all themes** - Verify appearance in light/dark modes

5. **Prefer semantic over brand** for UI elements
   - Buttons: `bg-primary` (unless specifically branded)
   - Backgrounds: `bg-background`, `bg-card`
   - Text: `text-foreground`, `text-muted-foreground`

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- **Avoid destructuring** - use explicit variable names for better traceability and context:
  - ✅ `const generateInvite = useGenerateInvite();` then `generateInvite()`
  - ❌ `const { mutate, isPending } = useMutation();`
  - ✅ `const user = getUserData();` then `user.name`
  - ❌ `const { name } = getUserData();`
  - This applies to objects, arrays, and all variable declarations
- Use `const` by default, `let` only when reassignment is needed, never `var`
- Types over Interfaces

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility
- Use React 19 features (ref as prop, no forwardRef needed)

### Next.js Specific

- Use App Router patterns (Server Components by default)
- Use Next.js `<Image>` component for images
- Use typed routes (enabled via `typedRoutes: true`)
- React Compiler is enabled - avoid manual memoization

### Error Handling

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages
- Use `try-catch` blocks meaningfully
- Prefer early returns over nested conditionals

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Validate and sanitize user input
- Never commit sensitive keys to `.env` (use `.env.example` for templates)

---

## Testing

Tests are not commonly run during development per user preference. Only run tests when explicitly instructed.

---

## ast-grep vs ripgrep

**Use `ast-grep` when structure matters** - for refactors, codemods, and precise code modifications.

**Use `ripgrep`** for fast text searches across files.

**Examples:**

```bash
# Find imports (structure-aware)
ast-grep run -l TypeScript -p 'import $X from "$P"'

# Codemod example
ast-grep run -l JavaScript -p 'var $A = $B' -r 'let $A = $B' -U

# Quick text search
rg -n 'console\.log\(' -t ts

# Combined: find files, then transform
rg -l -t ts 'useQuery\(' | xargs ast-grep run -l TypeScript -p 'useQuery($A)' -r 'useSuspenseQuery($A)' -U
```

---

Most formatting and common issues are automatically fixed by Biome. Run `bun fix` before committing to ensure compliance.
