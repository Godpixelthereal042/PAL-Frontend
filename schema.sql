-- SQL DDL Script for Supabase PostgreSQL Table Initialization
-- PAL v3.1 Production Hardening — Multi-Tenant Schema

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT,
    workspace_id TEXT,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    owner_id TEXT NOT NULL REFERENCES users(id),
    plan TEXT NOT NULL DEFAULT 'starter',
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    tier TEXT NOT NULL DEFAULT 'starter',
    status TEXT NOT NULL DEFAULT 'active',
    current_period_start BIGINT,
    current_period_end BIGINT,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
    expires_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS profile (
    id TEXT PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    email TEXT NOT NULL,
    "companyName" TEXT,
    "targetAudience" TEXT,
    "primaryKPI" TEXT,
    "selectedPersona" TEXT,
    workspace_id TEXT
);

CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    workspace_id TEXT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    color TEXT NOT NULL,
    goal TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'Planning',
    due_date TEXT,
    owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    workspace_id TEXT
);

CREATE TABLE IF NOT EXISTS project_members (
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'Member',
    PRIMARY KEY (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    workspace_id TEXT,
    client TEXT NOT NULL,
    amount TEXT NOT NULL,
    service TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS integrations (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    workspace_id TEXT,
    "isSynced" INTEGER NOT NULL DEFAULT 0,
    "isAutoSync" INTEGER NOT NULL DEFAULT 0,
    "syncedMessages" INTEGER NOT NULL DEFAULT 0,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at BIGINT
);

CREATE TABLE IF NOT EXISTS decisions (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    workspace_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'decided',
    created_at BIGINT NOT NULL
);


CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    workspace_id TEXT,
    sender TEXT NOT NULL,
    text TEXT NOT NULL,
    time TEXT NOT NULL,
    timestamp BIGINT NOT NULL,
    image TEXT,
    attachments TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    workspace_id TEXT,
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    time TEXT NOT NULL,
    "isUnread" INTEGER NOT NULL DEFAULT 1,
    section TEXT NOT NULL,
    "iconType" TEXT NOT NULL,
    "actionLabel" TEXT,
    "actionRoute" TEXT
);

CREATE TABLE IF NOT EXISTS logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    workspace_id TEXT,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    details TEXT,
    category TEXT NOT NULL,
    "isCompleted" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS briefs (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id TEXT,
    title TEXT NOT NULL,
    starts_at TEXT NOT NULL,
    ends_at TEXT NOT NULL,
    status TEXT,
    synced_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    workspace_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'not_started',
    priority TEXT NOT NULL DEFAULT 'medium',
    assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    due_date TEXT,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS otp_codes (
    email TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    expires_at BIGINT NOT NULL
);

-- Business Brain Tables (Milestone 1A)

CREATE TABLE IF NOT EXISTS business_brain (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    workspace_id TEXT,
    business_name TEXT,
    business_description TEXT,
    industry TEXT,
    business_stage TEXT,
    target_market TEXT,
    priorities TEXT,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS business_goals (
    id TEXT PRIMARY KEY,
    brain_id TEXT NOT NULL REFERENCES business_brain(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    timeframe TEXT,
    status TEXT DEFAULT 'active',
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS business_offers (
    id TEXT PRIMARY KEY,
    brain_id TEXT NOT NULL REFERENCES business_brain(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    offer_type TEXT,
    price TEXT,
    status TEXT DEFAULT 'active',
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS business_customer_segments (
    id TEXT PRIMARY KEY,
    brain_id TEXT NOT NULL REFERENCES business_brain(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS business_challenges (
    id TEXT PRIMARY KEY,
    brain_id TEXT NOT NULL REFERENCES business_brain(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'active',
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS business_notes (
    id TEXT PRIMARY KEY,
    brain_id TEXT NOT NULL REFERENCES business_brain(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    category TEXT,
    created_at BIGINT NOT NULL
);

-- Sprint 20 Autonomous Platform Tables (v2.0.0)

CREATE TABLE IF NOT EXISTS command_os_reports (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    workspace_id TEXT,
    health_score INTEGER NOT NULL,
    health_grade TEXT NOT NULL,
    dimensions_json TEXT NOT NULL,
    active_risks_json TEXT,
    opportunities_json TEXT,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_mesh_messages (
    id TEXT PRIMARY KEY,
    workspace_id TEXT,
    from_agent TEXT NOT NULL,
    to_agent TEXT NOT NULL,
    message_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    urgency TEXT NOT NULL,
    data_payload_json TEXT NOT NULL,
    reasoning_context_json TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS autonomous_actions (
    id TEXT PRIMARY KEY,
    workspace_id TEXT,
    agent_role TEXT NOT NULL,
    action_level INTEGER NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    cost_usd NUMERIC DEFAULT 0,
    passport_id TEXT,
    rollback_plan TEXT,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS institutional_memories (
    id TEXT PRIMARY KEY,
    workspace_id TEXT,
    category TEXT NOT NULL,
    topic TEXT NOT NULL,
    decision_date TEXT NOT NULL,
    synthesized_rationale TEXT NOT NULL,
    evidence_sources_json TEXT NOT NULL,
    confidence_score NUMERIC DEFAULT 1.0,
    created_at BIGINT NOT NULL
);

-- Sprint 21 Autonomous Company Validation Layer Tables (v2.1.0)

CREATE TABLE IF NOT EXISTS runtime_snapshots (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    workspace_id TEXT,
    checkpoint_version INTEGER NOT NULL,
    snapshot_payload_json TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS pilot_baselines (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    workspace_id TEXT,
    company_name TEXT NOT NULL,
    industry_template TEXT NOT NULL,
    health_score INTEGER NOT NULL,
    day_zero_insight TEXT NOT NULL,
    projected_90day_roi_usd NUMERIC NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS webhook_logs (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    event_type TEXT NOT NULL,
    signature_verified INTEGER NOT NULL DEFAULT 1,
    event_payload_json TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS approval_cards (
    id TEXT PRIMARY KEY,
    workspace_id TEXT,
    action_id TEXT NOT NULL,
    agent_role TEXT NOT NULL,
    what_happened TEXT NOT NULL,
    why_recommended TEXT NOT NULL,
    supporting_evidence_json TEXT NOT NULL,
    if_approved TEXT NOT NULL,
    if_rejected TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS roi_reports (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    workspace_id TEXT,
    company_name TEXT NOT NULL,
    timeframe_days INTEGER NOT NULL,
    total_business_value_usd NUMERIC NOT NULL,
    roi_multiple NUMERIC NOT NULL,
    case_study_headline TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

-- Sprint 22 Enterprise Reality Layer Tables (v2.2.0)

CREATE TABLE IF NOT EXISTS production_db_clusters (
    id TEXT PRIMARY KEY,
    primary_region TEXT NOT NULL,
    connection_pool_size INTEGER NOT NULL,
    migration_version INTEGER NOT NULL,
    backup_status TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    sso_provider TEXT,
    status TEXT DEFAULT 'active',
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS installed_connectors (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    connector_id TEXT NOT NULL,
    connector_name TEXT NOT NULL,
    publisher_name TEXT NOT NULL,
    is_verified INTEGER NOT NULL DEFAULT 1,
    health_status TEXT DEFAULT 'healthy',
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS customer_deployments (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    current_step INTEGER NOT NULL DEFAULT 1,
    is_go_live_completed INTEGER NOT NULL DEFAULT 0,
    pal_adoption_score_pct INTEGER DEFAULT 0,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS security_questionnaires (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    soc2_status TEXT NOT NULL,
    gdpr_status TEXT NOT NULL,
    iso27001_status TEXT NOT NULL,
    answers_count INTEGER NOT NULL,
    created_at BIGINT NOT NULL
);

-- Sprint 23 Pilot Deployment & Intelligence Loop Tables (v2.3.0)

CREATE TABLE IF NOT EXISTS pilot_organizations (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    current_phase TEXT NOT NULL,
    health_score_pct INTEGER NOT NULL,
    active_users_count INTEGER NOT NULL DEFAULT 1,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS business_signals (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    severity TEXT NOT NULL,
    estimated_impact_usd NUMERIC NOT NULL,
    recommended_action TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS impact_reports (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    total_net_benefit_usd NUMERIC NOT NULL,
    net_roi_multiple NUMERIC NOT NULL,
    headline_summary TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS reliability_reports (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    agent_uptime_pct NUMERIC NOT NULL,
    action_success_rate_pct NUMERIC NOT NULL,
    avg_approval_latency_hours NUMERIC NOT NULL,
    overall_reliability_score_pct INTEGER NOT NULL,
    status TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS pilot_feedback (
    id TEXT PRIMARY KEY,
    workspaceId TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    submitted_by_role TEXT NOT NULL,
    satisfaction_score INTEGER NOT NULL,
    ceo_sentiment TEXT NOT NULL,
    qualitative_feedback TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

-- Sprint 24 Market Proof & Autonomous Growth Layer Tables (v2.4.0)

CREATE TABLE IF NOT EXISTS customer_health_reports (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    adoption_pct INTEGER NOT NULL,
    trust_score_pct INTEGER NOT NULL,
    roi_generated_usd NUMERIC NOT NULL,
    churn_risk_level TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS growth_opportunities (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    expected_revenue_impact_usd NUMERIC NOT NULL,
    confidence_score_pct INTEGER NOT NULL,
    recommended_action TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS industry_benchmarks (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    metric_key TEXT NOT NULL,
    customer_current_value NUMERIC NOT NULL,
    industry_median_value NUMERIC NOT NULL,
    top_quartile_value NUMERIC NOT NULL,
    performance_tier TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS executive_reports (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    net_roi_usd NUMERIC NOT NULL,
    formatted_markdown TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS case_studies (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    headline TEXT NOT NULL,
    net_roi_multiple NUMERIC NOT NULL,
    total_value_created_usd NUMERIC NOT NULL,
    full_markdown TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

-- Sprint 25 Commercial Deployment & Revenue Engine Tables (v2.5.0)

CREATE TABLE IF NOT EXISTS prospect_sales_analyses (
    id TEXT PRIMARY KEY,
    prospect_domain TEXT NOT NULL,
    company_name TEXT NOT NULL,
    enterprise_fit_score_pct INTEGER NOT NULL,
    predicted_annual_roi_multiple NUMERIC NOT NULL,
    readiness_status TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS onboarding_sessions (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    status TEXT NOT NULL,
    time_to_first_value_hours NUMERIC NOT NULL,
    is_24h_sla_met INTEGER NOT NULL DEFAULT 1,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS pricing_analyses (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    current_plan_name TEXT NOT NULL,
    measured_monthly_value_usd NUMERIC NOT NULL,
    value_to_price_ratio NUMERIC NOT NULL,
    is_underpriced INTEGER NOT NULL DEFAULT 1,
    recommended_plan_name TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS trust_portals (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    security_posture_grade TEXT NOT NULL,
    soc2_status TEXT NOT NULL,
    gdpr_status TEXT NOT NULL,
    iso27001_status TEXT NOT NULL,
    historical_uptime_pct NUMERIC NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS expansion_recommendations (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    department TEXT NOT NULL,
    usage_growth_pct INTEGER NOT NULL,
    suggested_agent_role TEXT NOT NULL,
    projected_additional_value_usd NUMERIC NOT NULL,
    created_at BIGINT NOT NULL
);

-- Sprint 26 Enterprise Growth Network Tables (v2.6.0)

CREATE TABLE IF NOT EXISTS partner_profiles (
    id TEXT PRIMARY KEY,
    partner_name TEXT NOT NULL,
    partner_type TEXT NOT NULL,
    certification_tier TEXT NOT NULL,
    active_deployments_count INTEGER NOT NULL DEFAULT 0,
    attributed_revenue_usd NUMERIC NOT NULL DEFAULT 0,
    referral_performance_score_pct INTEGER NOT NULL DEFAULT 100,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS certification_records (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL,
    learner_name TEXT NOT NULL,
    track TEXT NOT NULL,
    score_pct INTEGER NOT NULL,
    is_certified INTEGER NOT NULL DEFAULT 0,
    issued_at BIGINT,
    expires_at BIGINT
);

CREATE TABLE IF NOT EXISTS prebuilt_ai_teams (
    id TEXT PRIMARY KEY,
    package_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    partner_publisher_name TEXT NOT NULL,
    verification_status TEXT NOT NULL,
    rating_stars NUMERIC NOT NULL,
    active_installs_count INTEGER NOT NULL DEFAULT 0,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS customer_success_reports (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    health_score_pct INTEGER NOT NULL,
    renewal_probability_pct INTEGER NOT NULL,
    satisfaction_trend TEXT NOT NULL,
    expansion_opportunities_usd NUMERIC NOT NULL DEFAULT 0,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS growth_network_referrals (
    id TEXT PRIMARY KEY,
    referrer_workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    referee_domain TEXT NOT NULL,
    conversion_status TEXT NOT NULL,
    viral_k_factor NUMERIC NOT NULL DEFAULT 1.0,
    created_at BIGINT NOT NULL
);

-- Sprint 27 Category Leadership & Enterprise Scale Tables (v2.7.0)

CREATE TABLE IF NOT EXISTS industry_intelligence_reports (
    id TEXT PRIMARY KEY,
    industry TEXT NOT NULL,
    vertical_growth_rate_pct NUMERIC NOT NULL,
    regulatory_alerts_count INTEGER NOT NULL DEFAULT 0,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS strategic_plans (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    horizon_months INTEGER NOT NULL DEFAULT 12,
    primary_growth_target_usd NUMERIC NOT NULL,
    simulated_success_confidence_pct INTEGER NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS global_benchmarks (
    id TEXT PRIMARY KEY,
    industry TEXT NOT NULL,
    k_anonymity_factor INTEGER NOT NULL DEFAULT 10,
    differential_privacy_epsilon NUMERIC NOT NULL DEFAULT 0.5,
    gross_margin_percentile INTEGER NOT NULL,
    ai_adoption_percentile INTEGER NOT NULL,
    operational_efficiency_score INTEGER NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS command_center_snapshots (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    overall_health_score_pct INTEGER NOT NULL,
    active_ai_employees_count INTEGER NOT NULL,
    pending_approvals_count INTEGER NOT NULL,
    projected_net_value_quarter_usd NUMERIC NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS custom_agent_definitions (
    id TEXT PRIMARY KEY,
    agent_name TEXT NOT NULL,
    domain_role TEXT NOT NULL,
    is_sandboxed INTEGER NOT NULL DEFAULT 1,
    publishing_status TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

-- Sprint 28 Enterprise Deployment & Intelligence Moat Tables (v2.8.0)

CREATE TABLE IF NOT EXISTS enterprise_pilot_records (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    current_stage TEXT NOT NULL,
    active_connectors_count INTEGER NOT NULL DEFAULT 0,
    adoption_rate_pct INTEGER NOT NULL DEFAULT 0,
    executive_engagement_score_pct INTEGER NOT NULL DEFAULT 100,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS outcome_learning_records (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    recommendation_title TEXT NOT NULL,
    predicted_value_usd NUMERIC NOT NULL,
    actual_measured_value_usd NUMERIC NOT NULL,
    prediction_accuracy_pct NUMERIC NOT NULL,
    learning_adjustment_factor NUMERIC NOT NULL DEFAULT 0.05,
    status TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS ceo_decision_profiles (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    executive_role TEXT NOT NULL DEFAULT 'CEO',
    risk_tolerance_profile TEXT NOT NULL,
    historical_approval_rate_pct INTEGER NOT NULL DEFAULT 100,
    predicted_decision_likelihood_pct INTEGER NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS market_research_alerts (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    headline TEXT NOT NULL,
    impact_severity TEXT NOT NULL,
    strategic_alert_summary TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS developer_api_keys (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    api_key_masked TEXT NOT NULL,
    rate_limit_rpm INTEGER NOT NULL DEFAULT 600,
    total_requests_count INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at BIGINT NOT NULL
);










