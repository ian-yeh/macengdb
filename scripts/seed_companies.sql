INSERT INTO companies (name, industries, rating, created_at, updated_at) VALUES
('Ericsson', ARRAY['Technology', 'Telecom'], 0, NOW(), NOW()),
('MongoDB', ARRAY['Technology', 'Software', 'Databases'], 0, NOW(), NOW()),
('Cohere', ARRAY['Technology', 'AI'], 0, NOW(), NOW()),
('PointClickCare', ARRAY['Technology', 'Healthcare'], 0, NOW(), NOW()),
('AWS', ARRAY['Technology', 'Cloud'], 0, NOW(), NOW()),
('Dayforce', ARRAY['Technology', 'HR Software'], 0, NOW(), NOW()),
('HubSpot', ARRAY['Technology', 'Marketing', 'Software'], 0, NOW(), NOW()),
('theScore', ARRAY['Technology', 'Sports', 'Media'], 0, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;