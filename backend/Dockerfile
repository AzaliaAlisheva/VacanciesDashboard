# Stage 1: Build
FROM python:3.9-slim as builder

WORKDIR /app
COPY requirements.txt .

RUN pip install --user -r requirements.txt

# Stage 2: Runtime
FROM python:3.9-slim

WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .

# Ensure scripts in .local are usable
ENV PATH=/root/.local/bin:$PATH

EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "server:app"]