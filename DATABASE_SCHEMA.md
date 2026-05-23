# Database Schema Documentation

## Core Tables

### Users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(128) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Alerts
```sql
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    threat_level VARCHAR(50),  -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(50) DEFAULT 'ACTIVE',
    evidence_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Evidence
```sql
CREATE TABLE evidence (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(512),
    file_type VARCHAR(50),
    size_bytes INTEGER,
    hash_sha256 VARCHAR(64),
    uploaded_at TIMESTAMP DEFAULT NOW()
);
```

### Threat Checks
```sql
CREATE TABLE threat_checks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    input_value VARCHAR(512) NOT NULL,
    input_type VARCHAR(50),  -- URL, IP, DOMAIN, PHONE
    threat_score DECIMAL(3,2),
    is_threat BOOLEAN,
    services_checked TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Relationships

- Users → Alerts (1:Many)
- Users → Evidence (1:Many)
- Users → ThreatChecks (1:Many)

## Indexes

```sql
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_evidence_user_id ON evidence(user_id);
CREATE INDEX idx_threat_checks_user_id ON threat_checks(user_id);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);
```

## Migrations

Run migrations:
```bash
python manage.py migrate
```

Create new migration:
```bash
python manage.py makemigrations
```

See migration status:
```bash
python manage.py showmigrations
```
