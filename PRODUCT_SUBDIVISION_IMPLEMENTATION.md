# Product Subdivision Implementation

## Overview
Implemented functionality to manage product subdivisions and assign them to users (cashiers) and products. This allows controlling which products a cashier can sell based on their assigned subdivision.

## Backend Changes
1.  **Users Module**:
    *   Updated `CreateUserDto` and `UpdateUserDto` to include `assignedSubdivision` field.
    *   Updated `UsersService` to handle `assignedSubdivision` during user creation and updates.

## Frontend Changes
1.  **User Management**:
    *   Updated `UserForm` to include an "Assigned Subdivision" dropdown when the "Cashier" role is selected.
    *   Admins can now assign a specific subdivision (e.g., "Cashback & Accessories" or "Frozen Products & Drinks") to a cashier.
    *   Updated `user.service.ts` types to support the new field.

2.  **Product Management**:
    *   Updated `ProductForm` to include a "Subdivision" dropdown.
    *   Admins can now assign products to a specific subdivision during creation or update.
    *   Updated `product.service.ts` types to support the new field.

## Usage
1.  **Assign Subdivision to Cashier**:
    *   Go to **Users** page.
    *   Create or Edit a user.
    *   Select Role: **Cashier**.
    *   Select the desired **Assigned Subdivision**.
2.  **Assign Product to Subdivision**:
    *   Go to **Products** page.
    *   Create or Edit a product.
    *   Select the desired **Subdivision**.

## Notes
*   Cashiers with an assigned subdivision will only be allowed to process sales for products within that subdivision.
*   Admins have unrestricted access to all products.
