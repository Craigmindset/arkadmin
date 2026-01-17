-- Create broadcast_update table
CREATE TABLE broadcast_update (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  event_time TIMESTAMP,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create prayer_update table
CREATE TABLE prayer_update (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_url VARCHAR(500),
  event_time VARCHAR(50),
  frequency VARCHAR(50) DEFAULT 'Daily',
  active BOOLEAN DEFAULT true,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_broadcast_update_active ON broadcast_update(active);
CREATE INDEX idx_broadcast_update_created ON broadcast_update(created_at);
CREATE INDEX idx_prayer_update_active ON prayer_update(active);
CREATE INDEX idx_prayer_update_sort ON prayer_update(sort_order);
