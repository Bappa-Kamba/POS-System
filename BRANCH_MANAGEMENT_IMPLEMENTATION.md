# Branch Management Implementation

## Overview
Implemented a comprehensive branch management system allowing administrators to create branches and assign users (cashiers) to specific branches.

## Backend Changes
1.  **Branches Module**:
    *   Created `BranchesModule`, `BranchesService`, and `BranchesController`.
    *   Implemented CRUD operations for branches.
    *   Added branch statistics endpoint.
    *   Registered module in `AppModule`.

2.  **Users Module**:
    *   Updated `UsersController` to allow ADMIN users to view all users across all branches.
    *   Non-admin users are still restricted to their assigned branch.

## Frontend Changes
1.  **Branch Management**:
    *   Created `BranchesPage` for listing and managing branches.
    *   Implemented `BranchTable` to display branch details and statistics.
    *   Implemented `BranchForm` for creating and editing branches.
    *   Added `branch.service.ts` and `useBranches` hooks.

2.  **User Management**:
    *   Updated `UserForm` to include a dynamic branch selection dropdown.
    *   Removed hardcoded branch assignment, allowing Admins to assign users to any branch.
    *   Updated `UsersPage` to show users from all branches for Admins.

3.  **Navigation**:
    *   Added "Branches" link to the main navigation bar for Admin users.
    *   Added routing for `/branches`.

## Usage
1.  **Create Branch**: Navigate to "Branches" in the admin dashboard and click "Add Branch".
2.  **Assign Cashier**: Navigate to "Users", click "Add User", and select the desired branch from the dropdown.
