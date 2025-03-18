-- Create the Staff_Service database
CREATE DATABASE IF NOT EXISTS Staff_Service;

-- Create the Assessment_Service database (if needed)
CREATE DATABASE IF NOT EXISTS Assessment_Service;

-- Grant all privileges to the 'admin' user for Staff_Service
GRANT ALL PRIVILEGES ON Staff_Service.* TO 'admin'@'%' IDENTIFIED BY 'admin';

-- Grant all privileges to the 'admin' user for Assessment_Service
GRANT ALL PRIVILEGES ON Assessment_Service.* TO 'admin'@'%' IDENTIFIED BY 'admin';

-- Apply the changes
FLUSH PRIVILEGES;