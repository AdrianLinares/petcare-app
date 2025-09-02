# Shadcn-UI Template Usage Instructions

## technology stack

This project is built with:

-   Vite
-   TypeScript
-   React
-   shadcn-ui
-   Tailwind CSS

All shadcn/ui components have been downloaded under `@/components/ui`.

## File Structure

-   `index.html` - HTML entry point
-   `vite.config.ts` - Vite configuration file
-   `tailwind.config.js` - Tailwind CSS configuration file
-   `package.json` - NPM dependencies and scripts
-   `src/app.tsx` - Root component of the project
-   `src/main.tsx` - Project entry point
-   `src/index.css` - Existing CSS configuration

## Components

-   All shadcn/ui components are pre-downloaded and available at `@/components/ui`

## Styling

-   Add global styles to `src/index.css` or create new CSS files as needed
-   Use Tailwind classes for styling components

## Development

-   Import components from `@/components/ui` in your React components
-   Customize the UI by modifying the Tailwind configuration

## Note

The `@/` path alias points to the `src/` directory

# Commands

**Install Dependencies**

```shell
pnpm i
```

**Start Preview**

```shell
pnpm run dev
```

**To build**

```shell
pnpm run build
```

Available Test Accounts:

Pet Owners:

1. Sarah Johnson
   • Email: sarah.johnson@email.com
   • Password: password123
   • User Type: Pet Owner
2. Michael Chen
   • Email: michael.chen@email.com
   • Password: password123
   • User Type: Pet Owner
3. Emma Rodriguez
   • Email: emma.rodriguez@email.com
   • Password: password123
   • User Type: Pet Owner

Veterinarians:

1. Dr. Maria Martinez
   • Email: dr.martinez@petcare.com
   • Password: vetpass123
   • User Type: Veterinarian
2. Dr. James Thompson
   • Email: dr.thompson@petcare.com
   • Password: vetpass123
   • User Type: Veterinarian

Administrator:

1. System Administrator
   • Email: admin@petcare.com
   • Password: adminpass123
   • User Type: Administrator
