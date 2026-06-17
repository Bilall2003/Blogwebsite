# ---- Database image: MySQL 8 with schema pre-loaded ----
# Build context is the repository root so we can reach server/db/schema.sql.
FROM mysql:8.0

# Scripts in this directory run automatically the first time the data
# directory is empty (i.e. on a fresh database).
COPY server/db/schema.sql /docker-entrypoint-initdb.d/01-schema.sql

EXPOSE 3306
