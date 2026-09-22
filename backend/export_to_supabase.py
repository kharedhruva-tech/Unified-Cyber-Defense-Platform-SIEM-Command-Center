import sqlite3
import os
import sys

def convert_sqlite_to_supabase_sql(db_path="cyber_defense.db", output_sql="supabase_schema_and_data.sql"):
    """Converts SQLite cyber_defense.db schema & dataset into PostgreSQL Supabase compatible SQL script."""
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        db_path,
        os.path.join(script_dir, db_path),
        os.path.join(script_dir, "..", db_path),
        os.path.abspath(db_path)
    ]
    
    resolved_db_path = None
    for cand in candidates:
        if os.path.exists(cand):
            resolved_db_path = cand
            break
            
    if not resolved_db_path:
        print(f"Error: Database file '{db_path}' not found in candidate locations: {candidates}")
        return

    print(f"Reading SQLite database: {resolved_db_path}...")
    conn = sqlite3.connect(resolved_db_path)
    cursor = conn.cursor()

    # Fetch all table names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
    tables = [r[0] for r in cursor.fetchall()]

    sql_statements = []
    sql_statements.append("-- ========================================================")
    sql_statements.append("-- UNIFIED CYBER DEFENSE SOLUTION - SUPABASE POSTGRESQL SCHEMA")
    sql_statements.append("-- Generated for Supabase Import")
    sql_statements.append("-- ========================================================\n")
    sql_statements.append("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";\n")

    # Table creation & Insert statements
    for table in tables:
        cursor.execute(f"PRAGMA table_info({table});")
        columns_info = cursor.fetchall()
        
        # Build CREATE TABLE
        col_defs = []
        col_names = []
        col_is_bool = []
        for col in columns_info:
            cid, name, col_type, notnull, dflt_value, pk = col
            col_names.append(name)
            
            # Map SQLite types to PostgreSQL / Supabase
            col_type_upper = col_type.upper()
            is_bool = ("BOOL" in col_type_upper) or name.startswith("is_") or name.startswith("has_") or name.startswith("can_")
            col_is_bool.append(is_bool)

            if pk:
                if "INT" in col_type_upper or col_type_upper == "" or name == "id":
                    pg_type = "BIGSERIAL PRIMARY KEY"
                else:
                    pg_type = "TEXT PRIMARY KEY"
            elif is_bool:
                pg_type = "BOOLEAN"
            elif "INT" in col_type_upper:
                pg_type = "BIGINT"
            elif "FLOAT" in col_type_upper or "REAL" in col_type_upper or "DOUBLE" in col_type_upper:
                pg_type = "DOUBLE PRECISION"
            elif "DATE" in col_type_upper or "TIME" in col_type_upper:
                pg_type = "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP"
            else:
                pg_type = "TEXT"
                
            col_defs.append(f"  \"{name}\" {pg_type}")
            
        create_table_sql = f"CREATE TABLE IF NOT EXISTS public.\"{table}\" (\n" + ",\n".join(col_defs) + "\n);"
        sql_statements.append(f"-- Table: {table}")
        sql_statements.append(create_table_sql + "\n")

        # Build INSERT DML
        cursor.execute(f"SELECT * FROM {table};")
        rows = cursor.fetchall()
        
        if rows:
            sql_statements.append(f"-- Data for {table} ({len(rows)} records)")
            cols_str = ", ".join([f"\"{c}\"" for c in col_names])
            
            for row in rows:
                val_parts = []
                for idx, val in enumerate(row):
                    if val is None:
                        val_parts.append("NULL")
                    elif col_is_bool[idx]:
                        # PostgreSQL requires TRUE / FALSE boolean literal values
                        if str(val).lower() in ("1", "true", "t", "yes"):
                            val_parts.append("TRUE")
                        else:
                            val_parts.append("FALSE")
                    elif isinstance(val, bool):
                        val_parts.append("TRUE" if val else "FALSE")
                    elif isinstance(val, (int, float)):
                        val_parts.append(str(val))
                    else:
                        # Escape single quotes
                        clean_str = str(val).replace("'", "''")
                        val_parts.append(f"'{clean_str}'")
                        
                row_str = ", ".join(val_parts)
                sql_statements.append(f"INSERT INTO public.\"{table}\" ({cols_str}) VALUES ({row_str}) ON CONFLICT DO NOTHING;")
            sql_statements.append("")

    # Append Sequence Reset SQL statements for PostgreSQL auto-increment sync
    sql_statements.append("-- ========================================================")
    sql_statements.append("-- RESET POSTGRESQL PRIMARY KEY SEQUENCES")
    sql_statements.append("-- ========================================================")
    for table in tables:
        sql_statements.append(f"SELECT setval(pg_get_serial_sequence('public.\"{table}\"', 'id'), COALESCE(MAX(id), 1)) FROM public.\"{table}\";")
    sql_statements.append("")

    conn.close()

    # Write output SQL file
    output_path = os.path.join(os.path.dirname(__file__), output_sql)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_statements))

    print(f"[SUCCESS] Supabase Migration SQL file successfully generated at:\n   {output_path}")
    print("\nHow to import into Supabase:")
    print("1. Log in to your Supabase Dashboard (https://supabase.com)")
    print("2. Open your project -> 'SQL Editor'")
    print("3. Copy & paste the contents of 'supabase_schema_and_data.sql' and click 'RUN'")
    print("4. Update your backend environment variable: DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres\n")

if __name__ == "__main__":
    convert_sqlite_to_supabase_sql()
