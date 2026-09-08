FROM python:3.13-slim

WORKDIR /app

# gcc + libpq-dev: a couple of packages (e.g. psycopg2-binary's transitive
# deps, cryptography) need a compiler available on some platforms even
# though most installs use prebuilt wheels.
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Matches the local uploads/ dir used for post images (mounted as a volume
# in production so uploads survive container restarts).
RUN mkdir -p uploads

EXPOSE 8000

# Run pending migrations, then start the API. Safe to run on every boot:
# alembic upgrade head is a no-op if the schema is already current.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
