# Supabase Migration Instructions

## Adding Reservation Fields to Orders Table

The reservation system requires additional columns in the `orders` table to store reservation type, date, and time.

### Steps to Apply Migration:

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor (left sidebar)

2. **Run the Migration SQL**
   - Open the file `supabase-migration-add-reservation-fields.sql`
   - Copy all the SQL code
   - Paste it into the Supabase SQL Editor
   - Click "Run" to execute the migration

3. **Verify the Migration**
   - The SQL includes a verification query at the end
   - You should see three new columns listed:
     - `reservation_type` (TEXT)
     - `reservation_date` (TEXT)
     - `reservation_time` (TEXT)

4. **Test the Application**
   - After running the migration, try creating a new reservation
   - The order should now save successfully to Supabase
   - Check the order history to verify reservation tags appear

### What This Migration Does:

- Adds `reservation_type` column with constraint for 'late-meal' or 'pre-order' values
- Adds `reservation_date` column to store the date in YYYY-MM-DD format
- Adds `reservation_time` column to store the time in HH:MM format
- All columns are nullable (optional) since regular orders won't have these fields
- Adds documentation comments for each column

### Fallback Behavior:

If you haven't run the migration yet, the application will:
- Show a warning toast message
- Save orders to localStorage as a fallback
- Continue to function normally (with local storage only)

### Alternative: Manual Column Addition

If you prefer to add columns manually through the Supabase UI:

1. Go to Table Editor → orders table
2. Add new columns:
   - **reservation_type**: Type = text, Nullable = true
   - **reservation_date**: Type = text, Nullable = true  
   - **reservation_time**: Type = text, Nullable = true
3. Save changes