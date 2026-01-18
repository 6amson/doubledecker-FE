Query Operations & Column Aliasing Guide
Overview
When operations modify or aggregate columns, the resulting column names change. To maintain predictable column references across operations, use aliases.

Operations That Change Column Names
1. GroupBy with Aggregations
Without alias:

{
  "type": "GroupBy",
  "columns": ["Release Artists"],
  "aggregations": [
    {
      "function": "Sum",
      "column": "Royalty ($US)"
    }
  ]
}
Result: Column becomes "SUM(Royalty ($US))" (DataFusion default)

With alias:

{
  "type": "GroupBy",
  "columns": ["Release Artists"],
  "aggregations": [
    {
      "function": "Sum",
      "column": "Royalty ($US)",
      "alias": "Royalty ($US)"  // Preserves original name
    }
  ]
}
Result: Column remains "Royalty ($US)"

2. Transform Operations
Always creates a new column:

{
  "type": "Transform",
  "column": "Royalty ($US)",
  "operation": "Multiply",
  "value": 1600,
  "alias": "Royalty_naira"  // Required - creates new column
}
Result: Original column "Royalty ($US)" still exists, plus new column "Royalty_naira"

Aggregation Function Naming
Function	Default Name Format	Example
Sum	SUM(column)	SUM(Royalty ($US))
Avg	AVG(column)	AVG(Royalty ($US))
Max	MAX(column)	MAX(Royalty ($US))
Min	MIN(column)	MIN(Royalty ($US))
Count	COUNT(column)	COUNT(Royalty ($US))
Frontend Logic Rules
Rule 1: Always Alias Aggregations
When using GroupBy, always provide an alias for aggregations to maintain predictable column names:

{
  "function": "Sum",
  "column": "Royalty ($US)",
  "alias": "Total_Royalty"  // ✅ Always include
}
Rule 2: Track Column Name Changes
After each operation, track which columns exist:

// Example state tracking
let availableColumns = ["Release Artists", "Royalty ($US)", "Count"];
// After GroupBy with alias
availableColumns = ["Release Artists", "Total_Royalty"];
// After Transform
availableColumns = ["Release Artists", "Total_Royalty", "Royalty_naira"];
Rule 3: Reference Correct Column Names
Subsequent operations must reference the current column name:

[
  {
    "type": "GroupBy",
    "columns": ["Release Artists"],
    "aggregations": [
      {
        "function": "Sum",
        "column": "Royalty ($US)",
        "alias": "Total_Royalty"
      }
    ]
  },
  {
    "type": "Sort",
    "column": "Total_Royalty",  // ✅ Use the alias
    "ascending": false
  }
]
Common Patterns
Pattern 1: Group, Transform, Sort
[
  {
    "type": "GroupBy",
    "columns": ["Release Artists"],
    "aggregations": [
      {
        "function": "Sum",
        "column": "Royalty ($US)",
        "alias": "Royalty ($US)"  // Keep original name
      }
    ]
  },
  {
    "type": "Transform",
    "column": "Royalty ($US)",  // References preserved name
    "operation": "Multiply",
    "value": 1600,
    "alias": "Royalty_naira"
  },
  {
    "type": "Sort",
    "column": "Royalty_naira",  // Sort by transformed column
    "ascending": false
  }
]
Pattern 2: Multiple Aggregations
{
  "type": "GroupBy",
  "columns": ["Release Artists"],
  "aggregations": [
    {
      "function": "Sum",
      "column": "Royalty ($US)",
      "alias": "Total_Royalty"
    },
    {
      "function": "Count",
      "column": "Track Title",
      "alias": "Track_Count"
    },
    {
      "function": "Avg",
      "column": "Royalty ($US)",
      "alias": "Avg_Royalty"
    }
  ]
}
Available columns after: ["Release Artists", "Total_Royalty", "Track_Count", "Avg_Royalty"]

Operations That Don't Change Column Names
These operations preserve column names:

Select: Keeps specified columns as-is
Filter: Doesn't modify column names
Sort: Doesn't modify column names
Limit: Doesn't modify column names
Quick Reference
Operation	Changes Columns?	Requires Alias?	Notes
Select	No	N/A	Keeps selected columns
Filter	No	N/A	Filters rows only
GroupBy	Yes	Recommended	Aggregations rename columns
Sort	No	N/A	Orders rows only
Limit	No	N/A	Limits row count
Transform	Yes	Required	Creates new column
Implementation Checklist
 Add alias field to all aggregation objects
 Track available column names after each operation
 Validate column references before adding operations
 Use consistent naming conventions for aliases
 Test multi-operation queries with aggregations