import { FunctionDeclaration, SchemaType } from '@google/generative-ai';

// Definitions for the Tools that Gemini can call.
// These are strictly bound to our mock views and Next API handlers.

export const toolDefinitions: FunctionDeclaration[] = [
    {
        name: 'getFinancialSummary',
        description: 'Retrieves current financial metrics (revenue, expenses, net income) for the tenant company.',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                department: {
                    type: SchemaType.STRING,
                    description: 'Optional department filter (e.g., "Marketing", "HR", "Sales"). If not provided, returns general company sum.',
                },
            },
            required: [], // tenantId is handled on the backend based on auth context, NEVER passed by AI
        },
    },
    {
        name: 'getInventoryStatus',
        description: 'Fetches the stock level of products, specifically highlighting items below reorder points.',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                productName: {
                    type: SchemaType.STRING,
                    description: 'Specific product name to search. Leave empty to get all items low in stock.',
                },
            },
            required: [],
        },
    },
    {
        name: 'getSalesPerformance',
        description: 'Checks the sales pipeline, conversions, and total revenue from recent closed deals.',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                status: {
                    type: SchemaType.STRING,
                    description: 'Filter by deal status e.g., "Won", "Lost", "In Progress".',
                },
            },
            required: [],
        },
    },
];
