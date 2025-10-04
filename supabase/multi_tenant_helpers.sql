-- Multi-Tenant Helper Functions and Views
-- File: supabase/multi_tenant_helpers.sql
-- Date: October 3, 2025
-- Purpose: Helper functions and views for multi-tenant operations

-- ===================================
-- HELPER FUNCTIONS
-- ===================================

-- Function to get current user's company context
CREATE OR REPLACE FUNCTION get_current_user_company()
RETURNS uuid AS $$
DECLARE
    company_uuid uuid;
BEGIN
    -- Get primary company for current user
    SELECT cu.company_id INTO company_uuid
    FROM company_users cu
    WHERE cu.user_id = auth.uid() 
    AND cu.is_primary = true 
    AND cu.status = 'active'
    LIMIT 1;
    
    -- If no primary company, get first active company
    IF company_uuid IS NULL THEN
        SELECT cu.company_id INTO company_uuid
        FROM company_users cu
        WHERE cu.user_id = auth.uid() 
        AND cu.status = 'active'
        ORDER BY cu.joined_at ASC
        LIMIT 1;
    END IF;
    
    RETURN company_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to switch user's primary company
CREATE OR REPLACE FUNCTION switch_primary_company(new_company_id uuid)
RETURNS boolean AS $$
DECLARE
    user_uuid uuid := auth.uid();
    has_access boolean := false;
BEGIN
    -- Check if user has access to this company
    SELECT user_has_company_access(user_uuid, new_company_id) INTO has_access;
    
    IF NOT has_access THEN
        RAISE EXCEPTION 'User does not have access to this company';
    END IF;
    
    -- Remove primary flag from all companies for this user
    UPDATE company_users 
    SET is_primary = false 
    WHERE user_id = user_uuid;
    
    -- Set new primary company
    UPDATE company_users 
    SET is_primary = true 
    WHERE user_id = user_uuid AND company_id = new_company_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to invite user to company
CREATE OR REPLACE FUNCTION invite_user_to_company(
    user_email text,
    company_uuid uuid,
    user_role user_role DEFAULT 'procurement',
    is_admin_user boolean DEFAULT false
)
RETURNS boolean AS $$
DECLARE
    user_uuid uuid;
    current_user_uuid uuid := auth.uid();
    is_current_user_admin boolean := false;
BEGIN
    -- Check if current user is admin of the company
    SELECT cu.is_admin INTO is_current_user_admin
    FROM company_users cu
    WHERE cu.user_id = current_user_uuid 
    AND cu.company_id = company_uuid 
    AND cu.status = 'active';
    
    IF NOT is_current_user_admin THEN
        RAISE EXCEPTION 'Only company admins can invite users';
    END IF;
    
    -- Find user by email
    SELECT p.id INTO user_uuid
    FROM profiles p
    WHERE p.email = user_email;
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Check if user is already in company
    IF EXISTS(SELECT 1 FROM company_users WHERE user_id = user_uuid AND company_id = company_uuid) THEN
        RAISE EXCEPTION 'User is already a member of this company';
    END IF;
    
    -- Add user to company
    INSERT INTO company_users (company_id, user_id, role, is_admin, is_primary, status)
    VALUES (company_uuid, user_uuid, user_role, is_admin_user, false, 'active');
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove user from company
CREATE OR REPLACE FUNCTION remove_user_from_company(
    user_uuid uuid,
    company_uuid uuid
)
RETURNS boolean AS $$
DECLARE
    current_user_uuid uuid := auth.uid();
    is_current_user_admin boolean := false;
BEGIN
    -- Check if current user is admin of the company
    SELECT cu.is_admin INTO is_current_user_admin
    FROM company_users cu
    WHERE cu.user_id = current_user_uuid 
    AND cu.company_id = company_uuid 
    AND cu.status = 'active';
    
    IF NOT is_current_user_admin THEN
        RAISE EXCEPTION 'Only company admins can remove users';
    END IF;
    
    -- Remove user from company
    DELETE FROM company_users 
    WHERE user_id = user_uuid AND company_id = company_uuid;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- USEFUL VIEWS
-- ===================================

-- View for user's company dashboard
CREATE OR REPLACE VIEW user_company_dashboard AS
SELECT 
    cu.company_id,
    c.name as company_name,
    c.code as company_code,
    cu.role,
    cu.is_admin,
    cu.is_primary,
    -- Contract stats
    (SELECT COUNT(*) FROM contracts WHERE company_id = cu.company_id) as total_contracts,
    (SELECT COUNT(*) FROM contracts WHERE company_id = cu.company_id AND status = 'Active') as active_contracts,
    (SELECT COUNT(*) FROM contracts WHERE company_id = cu.company_id AND status = 'Expired') as expired_contracts,
    (SELECT COUNT(*) FROM contracts WHERE company_id = cu.company_id AND risk = 'High') as high_risk_contracts,
    -- Financial stats
    (SELECT COALESCE(SUM(value_rp), 0) FROM contracts WHERE company_id = cu.company_id AND status = 'Active') as total_active_value,
    -- User stats
    (SELECT COUNT(*) FROM company_users WHERE company_id = cu.company_id AND status = 'active') as total_users,
    -- Recent activity
    (SELECT MAX(created_at) FROM contracts WHERE company_id = cu.company_id) as last_contract_created
FROM company_users cu
JOIN companies c ON cu.company_id = c.id
WHERE cu.user_id = auth.uid() AND cu.status = 'active' AND c.is_active = true;

-- View for company contracts with enhanced info
CREATE OR REPLACE VIEW company_contracts_view AS
SELECT 
    c.*,
    comp.name as company_name,
    comp.code as company_code,
    -- Risk analysis info
    ara.risk_level as ai_risk_level,
    ara.confidence as ai_confidence,
    ara.analyzed_at as last_risk_analysis,
    -- Document info
    (SELECT COUNT(*) FROM contract_documents cd WHERE cd.contract_id = c.id AND cd.is_active = true) as document_count,
    -- Lifecycle info
    (SELECT stage FROM contract_lifecycle cl WHERE cl.contract_id = c.id ORDER BY cl.started_at DESC LIMIT 1) as current_stage,
    -- Notes count
    (SELECT COUNT(*) FROM legal_notes ln WHERE ln.contract_id = c.id) as notes_count,
    -- Days until expiry
    CASE 
        WHEN c.end_date IS NOT NULL THEN c.end_date - CURRENT_DATE
        ELSE NULL
    END as days_until_expiry
FROM contracts c
JOIN companies comp ON c.company_id = comp.id
LEFT JOIN ai_risk_analysis ara ON c.id = ara.contract_id
WHERE c.company_id IN (
    SELECT cu.company_id 
    FROM company_users cu 
    WHERE cu.user_id = auth.uid() AND cu.status = 'active'
);

-- View for company KPI summary
CREATE OR REPLACE VIEW company_kpi_summary AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    c.code as company_code,
    -- Contract KPIs
    COUNT(co.id) as total_contracts,
    COUNT(CASE WHEN co.status = 'Active' THEN 1 END) as active_contracts,
    COUNT(CASE WHEN co.status = 'Expired' THEN 1 END) as expired_contracts,
    COUNT(CASE WHEN co.risk = 'High' THEN 1 END) as high_risk_contracts,
    COUNT(CASE WHEN co.risk = 'Medium' THEN 1 END) as medium_risk_contracts,
    COUNT(CASE WHEN co.risk = 'Low' THEN 1 END) as low_risk_contracts,
    -- Financial KPIs
    COALESCE(SUM(co.value_rp), 0) as total_contract_value,
    COALESCE(SUM(CASE WHEN co.status = 'Active' THEN co.value_rp END), 0) as active_contract_value,
    COALESCE(AVG(co.value_rp), 0) as average_contract_value,
    -- Timeline KPIs
    COALESCE(AVG(co.duration_months), 0) as average_duration_months,
    COUNT(CASE WHEN co.end_date < CURRENT_DATE THEN 1 END) as expired_count,
    COUNT(CASE WHEN co.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days' THEN 1 END) as expiring_soon_count,
    -- User KPIs
    (SELECT COUNT(*) FROM company_users cu WHERE cu.company_id = c.id AND cu.status = 'active') as total_users,
    (SELECT COUNT(*) FROM company_users cu WHERE cu.company_id = c.id AND cu.is_admin = true AND cu.status = 'active') as admin_users
FROM companies c
LEFT JOIN contracts co ON c.id = co.company_id
WHERE c.is_active = true
AND c.id IN (
    SELECT cu.company_id 
    FROM company_users cu 
    WHERE cu.user_id = auth.uid() AND cu.status = 'active'
)
GROUP BY c.id, c.name, c.code;

-- ===================================
-- TRIGGER FUNCTIONS FOR AUDIT
-- ===================================

-- Function to log company data changes
CREATE OR REPLACE FUNCTION log_company_data_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- You can implement audit logging here
    -- For now, just ensure company_id is preserved
    IF TG_OP = 'INSERT' AND NEW.company_id IS NULL THEN
        NEW.company_id := get_current_user_company();
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- GRANT PERMISSIONS
-- ===================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_current_user_company() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_primary_company(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_companies(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_company_access(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION switch_primary_company(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION invite_user_to_company(text, uuid, user_role, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_user_from_company(uuid, uuid) TO authenticated;

-- Grant select permissions on views
GRANT SELECT ON user_company_dashboard TO authenticated;
GRANT SELECT ON company_contracts_view TO authenticated;
GRANT SELECT ON company_kpi_summary TO authenticated;