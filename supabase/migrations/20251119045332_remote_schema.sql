SET statement_timeout = 0
SET lock_timeout = 0
SET idle_in_transaction_session_timeout = 0
SET client_encoding = 'UTF8'
SET standard_conforming_strings = on
SELECT pg_catalog.set_config('search_path', '', false)
SET check_function_bodies = false
SET xmloption = content
SET client_min_messages = warning
SET row_security = off
COMMENT ON SCHEMA "public" IS 'standard public schema'
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql"
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions"
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions"
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault"
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions"
CREATE OR REPLACE FUNCTION "public"."check_and_create_achievements"("p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    goal_record RECORD;
    daily_streak INTEGER;
    weekly_entries INTEGER;
    monthly_entries INTEGER;
BEGIN
    -- Check for goal completion achievements
    FOR goal_record IN 
        SELECT * FROM goals 
        WHERE user_id = p_user_id 
        AND status = 'completed' 
        AND completion_date = CURRENT_DATE
        AND NOT EXISTS (
            SELECT 1 FROM achievements 
            WHERE goal_id = goal_record.id 
            AND milestone_type = 'custom'
        )
    LOOP
        INSERT INTO achievements (
            goal_id, user_id, title, description, date_achieved, 
            value_achieved, milestone_type, badge_icon, badge_color
        ) VALUES (
            goal_record.id, p_user_id, 
            'Goal Completed: ' || goal_record.title,
            'Congratulations on completing your goal!',
            CURRENT_DATE, goal_record.current_value, 'custom',
            '🎯', '#10B981'
        );
    END LOOP;

    -- Check for daily streak achievements
    SELECT COUNT(*) INTO daily_streak
    FROM daily_entries
    WHERE user_id = p_user_id
    AND date >= CURRENT_DATE - INTERVAL '6 days'
    AND date <= CURRENT_DATE;

    IF daily_streak >= 7 AND NOT EXISTS (
        SELECT 1 FROM achievements 
        WHERE user_id = p_user_id 
        AND milestone_type = 'daily'
        AND date_achieved = CURRENT_DATE
    ) THEN
        INSERT INTO achievements (
            user_id, title, description, date_achieved, 
            value_achieved, milestone_type, badge_icon, badge_color
        ) VALUES (
            p_user_id, '7-Day Streak!',
            'You''ve logged achievements for 7 consecutive days!',
            CURRENT_DATE, 7, 'daily', '🔥', '#F59E0B'
        );
    END IF;

    -- Check for weekly achievements (5+ entries this week)
    SELECT COUNT(*) INTO weekly_entries
    FROM daily_entries
    WHERE user_id = p_user_id
    AND date >= DATE_TRUNC('week', CURRENT_DATE)
    AND date <= CURRENT_DATE;

    IF weekly_entries >= 5 AND NOT EXISTS (
        SELECT 1 FROM achievements 
        WHERE user_id = p_user_id 
        AND milestone_type = 'weekly'
        AND date_achieved >= DATE_TRUNC('week', CURRENT_DATE)
    ) THEN
        INSERT INTO achievements (
            user_id, title, description, date_achieved, 
            value_achieved, milestone_type, badge_icon, badge_color
        ) VALUES (
            p_user_id, 'Weekly Warrior',
            'You''ve been consistently active this week!',
            CURRENT_DATE, weekly_entries, 'weekly', '⚡', '#8B5CF6'
        );
    END IF;

    -- Check for monthly achievements (20+ entries this month)
    SELECT COUNT(*) INTO monthly_entries
    FROM daily_entries
    WHERE user_id = p_user_id
    AND date >= DATE_TRUNC('month', CURRENT_DATE)
    AND date <= CURRENT_DATE;

    IF monthly_entries >= 20 AND NOT EXISTS (
        SELECT 1 FROM achievements 
        WHERE user_id = p_user_id 
        AND milestone_type = 'monthly'
        AND date_achieved >= DATE_TRUNC('month', CURRENT_DATE)
    ) THEN
        INSERT INTO achievements (
            user_id, title, description, date_achieved, 
            value_achieved, milestone_type, badge_icon, badge_color
        ) VALUES (
            p_user_id, 'Monthly Master',
            'Outstanding dedication this month!',
            CURRENT_DATE, monthly_entries, 'monthly', '👑', '#3B82F6'
        );
    END IF;
END;
$$
ALTER FUNCTION "public"."check_and_create_achievements"("p_user_id" "uuid") OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."create_daily_entry"("p_user_id" "uuid", "p_date" "date", "p_title" "text", "p_description" "text" DEFAULT NULL::"text", "p_category" "text" DEFAULT NULL::"text", "p_value" integer DEFAULT 1, "p_unit" "text" DEFAULT NULL::"text", "p_mood" "text" DEFAULT NULL::"text", "p_notes" "text" DEFAULT NULL::"text", "p_tags" "text"[] DEFAULT '{}'::"text"[], "p_goal_id" "uuid" DEFAULT NULL::"uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    new_entry_id UUID;
BEGIN
    INSERT INTO daily_entries (
        user_id, date, title, description, category, value, unit,
        mood, notes, tags, goal_id
    ) VALUES (
        p_user_id, p_date, p_title, p_description, p_category, p_value, p_unit,
        p_mood, p_notes, p_tags, p_goal_id
    ) RETURNING id INTO new_entry_id;
    
    RETURN new_entry_id;
END;
$$
ALTER FUNCTION "public"."create_daily_entry"("p_user_id" "uuid", "p_date" "date", "p_title" "text", "p_description" "text", "p_category" "text", "p_value" integer, "p_unit" "text", "p_mood" "text", "p_notes" "text", "p_tags" "text"[], "p_goal_id" "uuid") OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."create_daily_entry_with_project"("p_user_id" "uuid", "p_date" "date", "p_title" "text", "p_description" "text" DEFAULT NULL::"text", "p_category" "text" DEFAULT NULL::"text", "p_mood" "text" DEFAULT NULL::"text", "p_notes" "text" DEFAULT NULL::"text", "p_tags" "text"[] DEFAULT '{}'::"text"[], "p_goal_id" "uuid" DEFAULT NULL::"uuid", "p_project_id" "uuid" DEFAULT NULL::"uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    new_entry_id UUID;
BEGIN
    INSERT INTO daily_entries (
        user_id, date, title, description, category,
        mood, notes, tags, goal_id, project_id
    ) VALUES (
        p_user_id, p_date, p_title, p_description, p_category,
        p_mood, p_notes, p_tags, p_goal_id, p_project_id
    ) RETURNING id INTO new_entry_id;
    
    RETURN new_entry_id;
END;
$$
ALTER FUNCTION "public"."create_daily_entry_with_project"("p_user_id" "uuid", "p_date" "date", "p_title" "text", "p_description" "text", "p_category" "text", "p_mood" "text", "p_notes" "text", "p_tags" "text"[], "p_goal_id" "uuid", "p_project_id" "uuid") OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."create_goal"("p_user_id" "uuid", "p_title" "text", "p_description" "text" DEFAULT NULL::"text", "p_type" "text" DEFAULT 'task'::"text", "p_priority" "text" DEFAULT 'medium'::"text", "p_target_value" integer DEFAULT NULL::integer, "p_unit" "text" DEFAULT NULL::"text", "p_start_date" "date" DEFAULT CURRENT_DATE, "p_target_date" "date" DEFAULT NULL::"date", "p_category" "text" DEFAULT NULL::"text", "p_tags" "text"[] DEFAULT '{}'::"text"[], "p_project_id" "text" DEFAULT NULL::"text", "p_task_ids" "uuid"[] DEFAULT '{}'::"uuid"[]) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    new_goal_id UUID;
BEGIN
    INSERT INTO goals (
        user_id, title, description, type, priority, target_value, unit,
        start_date, target_date, category, tags, project_id, task_ids
    ) VALUES (
        p_user_id, p_title, p_description, p_type, p_priority, p_target_value, p_unit,
        p_start_date, p_target_date, p_category, p_tags, p_project_id, p_task_ids
    ) RETURNING id INTO new_goal_id;
    
    RETURN new_goal_id;
END;
$$
ALTER FUNCTION "public"."create_goal"("p_user_id" "uuid", "p_title" "text", "p_description" "text", "p_type" "text", "p_priority" "text", "p_target_value" integer, "p_unit" "text", "p_start_date" "date", "p_target_date" "date", "p_category" "text", "p_tags" "text"[], "p_project_id" "text", "p_task_ids" "uuid"[]) OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."create_goal_with_project"("p_user_id" "uuid", "p_title" "text", "p_description" "text" DEFAULT NULL::"text", "p_type" "text" DEFAULT 'task'::"text", "p_priority" "text" DEFAULT 'medium'::"text", "p_start_date" "date" DEFAULT CURRENT_DATE, "p_target_date" "date" DEFAULT NULL::"date", "p_category" "text" DEFAULT NULL::"text", "p_tags" "text"[] DEFAULT '{}'::"text"[], "p_project_uuid" "uuid" DEFAULT NULL::"uuid", "p_task_ids" "uuid"[] DEFAULT '{}'::"uuid"[]) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    new_goal_id UUID;
BEGIN
    INSERT INTO goals (
        user_id, title, description, type, priority,
        start_date, target_date, category, tags, project_uuid, task_ids
    ) VALUES (
        p_user_id, p_title, p_description, p_type, p_priority,
        p_start_date, p_target_date, p_category, p_tags, p_project_uuid, p_task_ids
    ) RETURNING id INTO new_goal_id;
    
    RETURN new_goal_id;
END;
$$
ALTER FUNCTION "public"."create_goal_with_project"("p_user_id" "uuid", "p_title" "text", "p_description" "text", "p_type" "text", "p_priority" "text", "p_start_date" "date", "p_target_date" "date", "p_category" "text", "p_tags" "text"[], "p_project_uuid" "uuid", "p_task_ids" "uuid"[]) OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."create_project"("p_user_id" "uuid", "p_name" "text", "p_description" "text" DEFAULT NULL::"text", "p_color" "text" DEFAULT '#8B5CF6'::"text", "p_priority" "text" DEFAULT 'medium'::"text", "p_start_date" "date" DEFAULT CURRENT_DATE, "p_target_date" "date" DEFAULT NULL::"date", "p_tags" "text"[] DEFAULT '{}'::"text"[]) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    new_project_id UUID;
BEGIN
    INSERT INTO projects (
        user_id, name, description, color, priority, start_date, target_date, tags
    ) VALUES (
        p_user_id, p_name, p_description, p_color, p_priority, p_start_date, p_target_date, p_tags
    ) RETURNING id INTO new_project_id;
    
    RETURN new_project_id;
END;
$$
ALTER FUNCTION "public"."create_project"("p_user_id" "uuid", "p_name" "text", "p_description" "text", "p_color" "text", "p_priority" "text", "p_start_date" "date", "p_target_date" "date", "p_tags" "text"[]) OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."get_goal_analytics"("p_user_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_goals', (SELECT COUNT(*) FROM goals WHERE user_id = p_user_id),
        'active_goals', (SELECT COUNT(*) FROM goals WHERE user_id = p_user_id AND status = 'active'),
        'completed_goals', (SELECT COUNT(*) FROM goals WHERE user_id = p_user_id AND status = 'completed'),
        'completion_rate', (
            CASE 
                WHEN (SELECT COUNT(*) FROM goals WHERE user_id = p_user_id) > 0 
                THEN ROUND(
                    (SELECT COUNT(*)::DECIMAL FROM goals WHERE user_id = p_user_id AND status = 'completed') * 100 / 
                    (SELECT COUNT(*) FROM goals WHERE user_id = p_user_id), 2
                )
                ELSE 0
            END
        ),
        'total_entries', (SELECT COUNT(*) FROM daily_entries WHERE user_id = p_user_id),
        'entries_this_week', (
            SELECT COUNT(*) FROM daily_entries 
            WHERE user_id = p_user_id 
            AND date >= DATE_TRUNC('week', CURRENT_DATE)
        ),
        'entries_this_month', (
            SELECT COUNT(*) FROM daily_entries 
            WHERE user_id = p_user_id 
            AND date >= DATE_TRUNC('month', CURRENT_DATE)
        ),
        'total_achievements', (SELECT COUNT(*) FROM achievements WHERE user_id = p_user_id),
        'current_streak', (
            WITH RECURSIVE streak_calc AS (
                SELECT date, 1 as streak_length
                FROM daily_entries 
                WHERE user_id = p_user_id AND date = CURRENT_DATE
                
                UNION ALL
                
                SELECT de.date, sc.streak_length + 1
                FROM daily_entries de
                JOIN streak_calc sc ON de.date = sc.date - INTERVAL '1 day'
                WHERE de.user_id = p_user_id
            )
            SELECT COALESCE(MAX(streak_length), 0) FROM streak_calc
        )
    ) INTO result;
    
    RETURN result;
END;
$$
ALTER FUNCTION "public"."get_goal_analytics"("p_user_id" "uuid") OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."get_project_details"("p_project_id" "uuid", "p_user_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'project', (
            SELECT row_to_json(p)
            FROM projects p
            WHERE p.id = p_project_id AND p.user_id = p_user_id
        ),
        'goals', (
            SELECT COALESCE(json_agg(g), '[]'::json)
            FROM goals g
            WHERE g.project_uuid = p_project_id AND g.user_id = p_user_id
        ),
        'entries', (
            SELECT COALESCE(json_agg(de), '[]'::json)
            FROM daily_entries de
            WHERE de.project_id = p_project_id AND de.user_id = p_user_id
            ORDER BY de.date DESC
        )
    ) INTO result;
    
    RETURN result;
END;
$$
ALTER FUNCTION "public"."get_project_details"("p_project_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."get_user_achievements"("p_user_id" "uuid") RETURNS TABLE("id" "uuid", "goal_id" "uuid", "user_id" "uuid", "title" "text", "description" "text", "date_achieved" "date", "value_achieved" integer, "milestone_type" "text", "badge_icon" "text", "badge_color" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id, a.goal_id, a.user_id, a.title, a.description,
        a.date_achieved, a.value_achieved, a.milestone_type,
        a.badge_icon, a.badge_color, a.created_at
    FROM achievements a
    WHERE a.user_id = p_user_id
    ORDER BY a.date_achieved DESC, a.created_at DESC;
END;
$$
ALTER FUNCTION "public"."get_user_achievements"("p_user_id" "uuid") OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."get_user_daily_entries"("p_user_id" "uuid", "p_start_date" "date" DEFAULT NULL::"date", "p_end_date" "date" DEFAULT NULL::"date") RETURNS TABLE("id" "uuid", "goal_id" "uuid", "user_id" "uuid", "date" "date", "title" "text", "description" "text", "category" "text", "value" integer, "unit" "text", "mood" "text", "notes" "text", "tags" "text"[], "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        de.id, de.goal_id, de.user_id, de.date, de.title, de.description,
        de.category, de.value, de.unit, de.mood, de.notes, de.tags,
        de.created_at, de.updated_at
    FROM daily_entries de
    WHERE de.user_id = p_user_id
    AND (p_start_date IS NULL OR de.date >= p_start_date)
    AND (p_end_date IS NULL OR de.date <= p_end_date)
    ORDER BY de.date DESC, de.created_at DESC;
END;
$$
ALTER FUNCTION "public"."get_user_daily_entries"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date") OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."get_user_goals"("p_user_id" "uuid", "p_status" "text" DEFAULT NULL::"text", "p_type" "text" DEFAULT NULL::"text") RETURNS TABLE("id" "uuid", "user_id" "uuid", "title" "text", "description" "text", "type" "text", "status" "text", "priority" "text", "target_value" integer, "current_value" integer, "unit" "text", "start_date" "date", "target_date" "date", "completion_date" "date", "category" "text", "tags" "text"[], "project_id" "text", "task_ids" "uuid"[], "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id, g.user_id, g.title, g.description, g.type, g.status, g.priority,
        g.target_value, g.current_value, g.unit, g.start_date, g.target_date,
        g.completion_date, g.category, g.tags, g.project_id, g.task_ids,
        g.created_at, g.updated_at
    FROM goals g
    WHERE g.user_id = p_user_id
    AND (p_status IS NULL OR g.status = p_status)
    AND (p_type IS NULL OR g.type = p_type)
    ORDER BY g.created_at DESC;
END;
$$
ALTER FUNCTION "public"."get_user_goals"("p_user_id" "uuid", "p_status" "text", "p_type" "text") OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."get_user_goals_with_projects"("p_user_id" "uuid", "p_status" "text" DEFAULT NULL::"text", "p_type" "text" DEFAULT NULL::"text", "p_project_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("id" "uuid", "user_id" "uuid", "title" "text", "description" "text", "type" "text", "status" "text", "priority" "text", "start_date" "date", "target_date" "date", "completion_date" "date", "category" "text", "tags" "text"[], "project_id" "text", "project_uuid" "uuid", "project_name" "text", "project_color" "text", "task_ids" "uuid"[], "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id, g.user_id, g.title, g.description, g.type, g.status, g.priority,
        g.start_date, g.target_date, g.completion_date, g.category, g.tags, 
        g.project_id, g.project_uuid, p.name as project_name, p.color as project_color,
        g.task_ids, g.created_at, g.updated_at
    FROM goals g
    LEFT JOIN projects p ON g.project_uuid = p.id
    WHERE g.user_id = p_user_id
    AND (p_status IS NULL OR g.status = p_status)
    AND (p_type IS NULL OR g.type = p_type)
    AND (p_project_id IS NULL OR g.project_uuid = p_project_id)
    ORDER BY g.created_at DESC;
END;
$$
ALTER FUNCTION "public"."get_user_goals_with_projects"("p_user_id" "uuid", "p_status" "text", "p_type" "text", "p_project_id" "uuid") OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."get_user_projects"("p_user_id" "uuid") RETURNS TABLE("id" "uuid", "user_id" "uuid", "name" "text", "description" "text", "color" "text", "status" "text", "priority" "text", "start_date" "date", "target_date" "date", "completion_date" "date", "tags" "text"[], "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "goals_count" bigint, "entries_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id, p.user_id, p.name, p.description, p.color, p.status, p.priority,
        p.start_date, p.target_date, p.completion_date, p.tags,
        p.created_at, p.updated_at,
        COALESCE(g.goals_count, 0) as goals_count,
        COALESCE(de.entries_count, 0) as entries_count
    FROM projects p
    LEFT JOIN (
        SELECT project_uuid, COUNT(*) as goals_count
        FROM goals
        WHERE project_uuid IS NOT NULL
        GROUP BY project_uuid
    ) g ON p.id = g.project_uuid
    LEFT JOIN (
        SELECT project_id, COUNT(*) as entries_count
        FROM daily_entries
        WHERE project_id IS NOT NULL
        GROUP BY project_id
    ) de ON p.id = de.project_id
    WHERE p.user_id = p_user_id
    ORDER BY p.created_at DESC;
END;
$$
ALTER FUNCTION "public"."get_user_projects"("p_user_id" "uuid") OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Function logic here
    RETURN NEW;
END;
$$
ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Your function logic here
    RETURN NEW;
END;
$$
ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."trigger_check_achievements"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    PERFORM check_and_create_achievements(NEW.user_id);
    RETURN NEW;
END;
$$
ALTER FUNCTION "public"."trigger_check_achievements"() OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."trigger_update_goal_progress"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        IF OLD.goal_id IS NOT NULL THEN
            PERFORM update_goal_progress(OLD.goal_id);
        END IF;
        RETURN OLD;
    ELSE
        IF NEW.goal_id IS NOT NULL THEN
            PERFORM update_goal_progress(NEW.goal_id);
        END IF;
        RETURN NEW;
    END IF;
END;
$$
ALTER FUNCTION "public"."trigger_update_goal_progress"() OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."trigger_update_task_total_time"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM update_task_total_time(OLD.task_id);
        RETURN OLD;
    ELSE
        PERFORM update_task_total_time(NEW.task_id);
        RETURN NEW;
    END IF;
END;
$$
ALTER FUNCTION "public"."trigger_update_task_total_time"() OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."update_accounts_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$
ALTER FUNCTION "public"."update_accounts_updated_at"() OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."update_budget_spent"("p_budget_id" "uuid", "p_amount" numeric) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE budgets
  SET spent = spent + p_amount,
      updated_at = NOW()
  WHERE id = p_budget_id;
END;
$$
ALTER FUNCTION "public"."update_budget_spent"("p_budget_id" "uuid", "p_amount" numeric) OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."update_goal_progress"("goal_uuid" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    UPDATE goals 
    SET current_value = (
        SELECT COALESCE(SUM(value), 0)
        FROM daily_entries 
        WHERE goal_id = goal_uuid
    ),
    updated_at = NOW()
    WHERE id = goal_uuid;
END;
$$
ALTER FUNCTION "public"."update_goal_progress"("goal_uuid" "uuid") OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."update_goal_status"("p_goal_id" "uuid", "p_status" "text", "p_completion_date" "date" DEFAULT NULL::"date") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    UPDATE goals 
    SET 
        status = p_status,
        completion_date = CASE 
            WHEN p_status = 'completed' THEN COALESCE(p_completion_date, CURRENT_DATE)
            ELSE completion_date
        END,
        updated_at = NOW()
    WHERE id = p_goal_id;
    
    RETURN FOUND;
END;
$$
ALTER FUNCTION "public"."update_goal_status"("p_goal_id" "uuid", "p_status" "text", "p_completion_date" "date") OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."update_task_projects_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$
ALTER FUNCTION "public"."update_task_projects_updated_at"() OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."update_task_total_time"("task_uuid" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    UPDATE tasks 
    SET total_time_seconds = (
        SELECT COALESCE(SUM(duration_seconds), 0)
        FROM time_entries 
        WHERE task_id = task_uuid AND duration_seconds IS NOT NULL
    )
    WHERE id = task_uuid;
END;
$$
ALTER FUNCTION "public"."update_task_total_time"("task_uuid" "uuid") OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$
ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres"
CREATE OR REPLACE FUNCTION "public"."your_trigger_function"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Set an explicit, minimal search path
    SET search_path TO pg_catalog, public;

    -- Your existing function logic here
    -- ...

    RETURN NEW; -- or appropriate return value
END;
$$
ALTER FUNCTION "public"."your_trigger_function"() OWNER TO "postgres"
SET default_tablespace = ''
SET default_table_access_method = "heap"
CREATE TABLE IF NOT EXISTS "public"."account_usage_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "account_id" "uuid" NOT NULL,
    "amount" integer NOT NULL,
    "description" "text",
    "timestamp" timestamp with time zone DEFAULT "now"()
)
ALTER TABLE "public"."account_usage_logs" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."accounts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "folder_id" "uuid",
    "title" "text" NOT NULL,
    "platform" "text" NOT NULL,
    "email_username" "text" NOT NULL,
    "password" "text" NOT NULL,
    "usage_type" "text" DEFAULT 'custom'::"text" NOT NULL,
    "usage_limit" integer,
    "current_usage" integer DEFAULT 0,
    "reset_period" "text" DEFAULT 'monthly'::"text",
    "description" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "accounts_reset_period_check" CHECK (("reset_period" = ANY (ARRAY['daily'::"text", 'weekly'::"text", 'monthly'::"text", 'yearly'::"text", 'never'::"text"])))
)
ALTER TABLE "public"."accounts" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."achievements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "goal_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "date_achieved" "date" NOT NULL,
    "value_achieved" integer DEFAULT 0 NOT NULL,
    "milestone_type" "text" NOT NULL,
    "badge_icon" "text",
    "badge_color" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "achievements_milestone_type_check" CHECK (("milestone_type" = ANY (ARRAY['daily'::"text", 'weekly'::"text", 'monthly'::"text", 'custom'::"text"])))
)
ALTER TABLE "public"."achievements" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."budget_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "budget_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "description" "text" NOT NULL,
    "category" "text" NOT NULL,
    "transaction_date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
)
ALTER TABLE "public"."budget_transactions" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."budgets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "spent" numeric(10,2) DEFAULT 0 NOT NULL,
    "category" "text" NOT NULL,
    "period" "text" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "color" "text" DEFAULT '#8B5CF6'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
)
ALTER TABLE "public"."budgets" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."daily_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "content" "text" NOT NULL,
    "entry_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "project_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "mood" smallint,
    "energy_level" smallint,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "daily_entries_energy_level_check" CHECK ((("energy_level" >= 1) AND ("energy_level" <= 5))),
    CONSTRAINT "daily_entries_mood_check" CHECK ((("mood" >= 1) AND ("mood" <= 5)))
)
ALTER TABLE "public"."daily_entries" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."folders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "parent_id" "uuid",
    "color" "text" DEFAULT '#8B5CF6'::"text" NOT NULL,
    "content" "text" NOT NULL,
    "category" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "usage_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "rich_content" "jsonb",
    "content_type" character varying(10) DEFAULT 'plain'::character varying,
    "is_pinned" boolean DEFAULT false,
    "is_favorite" boolean DEFAULT false
)
ALTER TABLE "public"."notes" OWNER TO "postgres"
COMMENT ON COLUMN "public"."notes"."is_pinned" IS 'Whether the note is pinned to the top'
COMMENT ON COLUMN "public"."notes"."is_favorite" IS 'Whether the note is marked as favorite'
CREATE TABLE IF NOT EXISTS "public"."pomodoro_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "session_type" "text" NOT NULL,
    "duration_minutes" integer NOT NULL,
    "completed" boolean DEFAULT false,
    "started_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    "task_id" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_paused" boolean DEFAULT false,
    "paused_at" timestamp with time zone,
    "total_paused_seconds" integer DEFAULT 0,
    CONSTRAINT "pomodoro_sessions_session_type_check" CHECK (("session_type" = ANY (ARRAY['work'::"text", 'short_break'::"text", 'long_break'::"text"])))
)
ALTER TABLE "public"."pomodoro_sessions" OWNER TO "postgres"
COMMENT ON TABLE "public"."pomodoro_sessions" IS 'User pomodoro timer sessions'
COMMENT ON COLUMN "public"."pomodoro_sessions"."is_paused" IS 'Whether the session is currently paused'
COMMENT ON COLUMN "public"."pomodoro_sessions"."paused_at" IS 'Timestamp when the session was paused'
COMMENT ON COLUMN "public"."pomodoro_sessions"."total_paused_seconds" IS 'Total seconds the session has been paused'
CREATE TABLE IF NOT EXISTS "public"."pomodoro_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "work_duration" integer DEFAULT 25,
    "short_break_duration" integer DEFAULT 5,
    "long_break_duration" integer DEFAULT 15,
    "sessions_until_long_break" integer DEFAULT 4,
    "auto_start_breaks" boolean DEFAULT false,
    "auto_start_work" boolean DEFAULT false,
    "sound_enabled" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
)
ALTER TABLE "public"."pomodoro_settings" OWNER TO "postgres"
COMMENT ON TABLE "public"."pomodoro_settings" IS 'User pomodoro timer settings'
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "email" "text",
    "full_name" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
)
ALTER TABLE "public"."profiles" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "color" character varying(7) DEFAULT '#10B981'::character varying,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "archived" boolean DEFAULT false NOT NULL
)
ALTER TABLE "public"."projects" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."task_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "archived" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
)
ALTER TABLE "public"."task_projects" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "completed" boolean DEFAULT false NOT NULL,
    "priority" "text" DEFAULT 'medium'::"text" NOT NULL,
    "due_date" "date",
    "assignee" "text",
    "project" "text",
    "labels" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completion_date" timestamp with time zone,
    "total_time_seconds" integer DEFAULT 0,
    "status" "text" DEFAULT 'todo'::"text",
    "kanban_position" integer DEFAULT 0,
    "is_on_kanban" boolean DEFAULT false,
    CONSTRAINT "tasks_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"]))),
    CONSTRAINT "tasks_status_check" CHECK (("status" = ANY (ARRAY['todo'::"text", 'in_progress'::"text", 'review'::"text", 'completed'::"text", 'blocked'::"text"])))
)
ALTER TABLE "public"."tasks" OWNER TO "postgres"
COMMENT ON COLUMN "public"."tasks"."status" IS 'Task status for kanban board: todo, in_progress, review, or completed'
COMMENT ON COLUMN "public"."tasks"."kanban_position" IS 'Position of task within its kanban column'
COMMENT ON COLUMN "public"."tasks"."is_on_kanban" IS 'Whether this task is displayed on the kanban board'
CREATE TABLE IF NOT EXISTS "public"."time_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "task_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone,
    "duration_seconds" integer,
    "description" "text",
    "is_running" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_paused" boolean DEFAULT false,
    "paused_at" timestamp with time zone,
    "total_paused_seconds" integer DEFAULT 0
)
ALTER TABLE "public"."time_entries" OWNER TO "postgres"
CREATE TABLE IF NOT EXISTS "public"."usage_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "account_id" "uuid" NOT NULL,
    "amount" integer NOT NULL,
    "usage_type" "text" NOT NULL,
    "description" "text",
    "timestamp" timestamp with time zone DEFAULT "now"()
)
ALTER TABLE "public"."usage_logs" OWNER TO "postgres"
ALTER TABLE ONLY "public"."account_usage_logs"
    ADD CONSTRAINT "account_usage_logs_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_user_platform_email_unique" UNIQUE ("user_id", "platform", "email_username")
ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."budget_transactions"
    ADD CONSTRAINT "budget_transactions_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."budgets"
    ADD CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."daily_entries"
    ADD CONSTRAINT "daily_entries_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."folders"
    ADD CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."lovable_accounts"
    ADD CONSTRAINT "lovable_accounts_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."pomodoro_sessions"
    ADD CONSTRAINT "pomodoro_sessions_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."pomodoro_settings"
    ADD CONSTRAINT "pomodoro_settings_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."pomodoro_settings"
    ADD CONSTRAINT "pomodoro_settings_user_id_key" UNIQUE ("user_id")
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id")
ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_name_user_id_key" UNIQUE ("name", "user_id")
ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."task_projects"
    ADD CONSTRAINT "task_projects_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."task_projects"
    ADD CONSTRAINT "task_projects_user_id_name_key" UNIQUE ("user_id", "name")
ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."time_entries"
    ADD CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
ALTER TABLE ONLY "public"."usage_logs"
    ADD CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id")
CREATE INDEX "idx_account_usage_logs_account_id" ON "public"."account_usage_logs" USING "btree" ("account_id")
CREATE INDEX "idx_account_usage_logs_timestamp" ON "public"."account_usage_logs" USING "btree" ("timestamp" DESC)
CREATE INDEX "idx_account_usage_logs_user_id" ON "public"."account_usage_logs" USING "btree" ("user_id")
CREATE INDEX "idx_accounts_created_at" ON "public"."accounts" USING "btree" ("created_at" DESC)
CREATE INDEX "idx_accounts_folder_id" ON "public"."accounts" USING "btree" ("folder_id")
CREATE INDEX "idx_accounts_platform" ON "public"."accounts" USING "btree" ("platform")
CREATE INDEX "idx_accounts_tags_gin" ON "public"."accounts" USING "gin" ("tags")
CREATE INDEX "idx_accounts_user_id" ON "public"."accounts" USING "btree" ("user_id")
CREATE INDEX "idx_achievements_date_achieved" ON "public"."achievements" USING "btree" ("date_achieved")
CREATE INDEX "idx_achievements_goal_id" ON "public"."achievements" USING "btree" ("goal_id")
CREATE INDEX "idx_achievements_milestone_type" ON "public"."achievements" USING "btree" ("milestone_type")
CREATE INDEX "idx_achievements_user_id" ON "public"."achievements" USING "btree" ("user_id")
CREATE INDEX "idx_budget_transactions_budget_id" ON "public"."budget_transactions" USING "btree" ("budget_id")
CREATE INDEX "idx_budget_transactions_date_category" ON "public"."budget_transactions" USING "btree" ("user_id", "transaction_date", "category")
CREATE INDEX "idx_budget_transactions_standalone" ON "public"."budget_transactions" USING "btree" ("user_id", "transaction_date") WHERE ("budget_id" IS NULL)
CREATE INDEX "idx_budget_transactions_user_id" ON "public"."budget_transactions" USING "btree" ("user_id")
CREATE INDEX "idx_budgets_user_id" ON "public"."budgets" USING "btree" ("user_id")
CREATE INDEX "idx_daily_entries_created_at" ON "public"."daily_entries" USING "btree" ("created_at" DESC)
CREATE INDEX "idx_daily_entries_project" ON "public"."daily_entries" USING "btree" ("project_id")
CREATE INDEX "idx_daily_entries_user_date" ON "public"."daily_entries" USING "btree" ("user_id", "entry_date" DESC)
CREATE INDEX "idx_folders_parent_id" ON "public"."folders" USING "btree" ("parent_id")
CREATE INDEX "idx_lovable_accounts_user_id" ON "public"."lovable_accounts" USING "btree" ("user_id")
CREATE INDEX "idx_notes_content_type" ON "public"."notes" USING "btree" ("content_type")
CREATE INDEX "idx_notes_is_favorite" ON "public"."notes" USING "btree" ("user_id", "is_favorite") WHERE ("is_favorite" = true)
CREATE INDEX "idx_notes_is_pinned" ON "public"."notes" USING "btree" ("user_id", "is_pinned") WHERE ("is_pinned" = true)
CREATE INDEX "idx_pomodoro_sessions_is_paused" ON "public"."pomodoro_sessions" USING "btree" ("is_paused") WHERE ("is_paused" = true)
CREATE INDEX "idx_pomodoro_sessions_started_at" ON "public"."pomodoro_sessions" USING "btree" ("started_at" DESC)
CREATE INDEX "idx_pomodoro_sessions_task_id" ON "public"."pomodoro_sessions" USING "btree" ("task_id")
CREATE INDEX "idx_pomodoro_sessions_user_id" ON "public"."pomodoro_sessions" USING "btree" ("user_id")
CREATE INDEX "idx_pomodoro_settings_user_id" ON "public"."pomodoro_settings" USING "btree" ("user_id")
CREATE INDEX "idx_projects_archived" ON "public"."projects" USING "btree" ("archived")
CREATE INDEX "idx_projects_user" ON "public"."projects" USING "btree" ("user_id")
CREATE INDEX "idx_projects_user_archived" ON "public"."projects" USING "btree" ("user_id", "archived")
CREATE INDEX "idx_task_projects_archived" ON "public"."task_projects" USING "btree" ("archived")
CREATE INDEX "idx_task_projects_name" ON "public"."task_projects" USING "btree" ("name")
CREATE INDEX "idx_task_projects_user_archived" ON "public"."task_projects" USING "btree" ("user_id", "archived")
CREATE INDEX "idx_task_projects_user_id" ON "public"."task_projects" USING "btree" ("user_id")
CREATE INDEX "idx_tasks_kanban" ON "public"."tasks" USING "btree" ("user_id", "project", "is_on_kanban", "status", "kanban_position")
CREATE INDEX "idx_tasks_user_id" ON "public"."tasks" USING "btree" ("user_id")
CREATE INDEX "idx_time_entries_is_paused" ON "public"."time_entries" USING "btree" ("is_paused")
CREATE INDEX "idx_time_entries_is_running" ON "public"."time_entries" USING "btree" ("is_running")
CREATE INDEX "idx_time_entries_start_time" ON "public"."time_entries" USING "btree" ("start_time")
CREATE INDEX "idx_time_entries_task_id" ON "public"."time_entries" USING "btree" ("task_id")
CREATE INDEX "idx_time_entries_user_id" ON "public"."time_entries" USING "btree" ("user_id")
CREATE INDEX "idx_usage_logs_account_id" ON "public"."usage_logs" USING "btree" ("account_id")
CREATE INDEX "idx_usage_logs_user_id" ON "public"."usage_logs" USING "btree" ("user_id")
CREATE OR REPLACE TRIGGER "accounts_updated_at_trigger" BEFORE UPDATE ON "public"."accounts" FOR EACH ROW EXECUTE FUNCTION "public"."update_accounts_updated_at"()
CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."tasks" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"()
CREATE OR REPLACE TRIGGER "time_entries_update_task_total" AFTER INSERT OR DELETE OR UPDATE ON "public"."time_entries" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_update_task_total_time"()
CREATE OR REPLACE TRIGGER "update_budgets_updated_at" BEFORE UPDATE ON "public"."budgets" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"()
CREATE OR REPLACE TRIGGER "update_daily_entries_updated_at" BEFORE UPDATE ON "public"."daily_entries" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"()
CREATE OR REPLACE TRIGGER "update_pomodoro_sessions_updated_at" BEFORE UPDATE ON "public"."pomodoro_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"()
CREATE OR REPLACE TRIGGER "update_pomodoro_settings_updated_at" BEFORE UPDATE ON "public"."pomodoro_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"()
CREATE OR REPLACE TRIGGER "update_projects_updated_at" BEFORE UPDATE ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"()
CREATE OR REPLACE TRIGGER "update_task_projects_updated_at" BEFORE UPDATE ON "public"."task_projects" FOR EACH ROW EXECUTE FUNCTION "public"."update_task_projects_updated_at"()
ALTER TABLE ONLY "public"."account_usage_logs"
    ADD CONSTRAINT "account_usage_logs_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."account_usage_logs"
    ADD CONSTRAINT "account_usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE SET NULL
ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."budget_transactions"
    ADD CONSTRAINT "budget_transactions_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."budget_transactions"
    ADD CONSTRAINT "budget_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."budgets"
    ADD CONSTRAINT "budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."daily_entries"
    ADD CONSTRAINT "daily_entries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL
ALTER TABLE ONLY "public"."daily_entries"
    ADD CONSTRAINT "daily_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."folders"
    ADD CONSTRAINT "folders_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."folders"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."lovable_accounts"
    ADD CONSTRAINT "lovable_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE SET NULL
ALTER TABLE ONLY "public"."pomodoro_sessions"
    ADD CONSTRAINT "pomodoro_sessions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE SET NULL
ALTER TABLE ONLY "public"."pomodoro_sessions"
    ADD CONSTRAINT "pomodoro_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."pomodoro_settings"
    ADD CONSTRAINT "pomodoro_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."task_projects"
    ADD CONSTRAINT "task_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id")
ALTER TABLE ONLY "public"."time_entries"
    ADD CONSTRAINT "time_entries_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."time_entries"
    ADD CONSTRAINT "time_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."usage_logs"
    ADD CONSTRAINT "usage_logs_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."lovable_accounts"("id") ON DELETE CASCADE
ALTER TABLE ONLY "public"."usage_logs"
    ADD CONSTRAINT "usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
CREATE POLICY "Users can create their own account usage logs" ON "public"."account_usage_logs" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()))
CREATE POLICY "Users can create their own accounts" ON "public"."accounts" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()))
CREATE POLICY "Users can create their own budgets" ON "public"."budgets" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can create their own notes" ON "public"."notes" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()))
CREATE POLICY "Users can create their own transactions" ON "public"."budget_transactions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can delete their own account usage logs" ON "public"."account_usage_logs" FOR DELETE USING (("user_id" = "auth"."uid"()))
CREATE POLICY "Users can delete their own accounts" ON "public"."accounts" FOR DELETE USING (("user_id" = "auth"."uid"()))
CREATE POLICY "Users can delete their own achievements" ON "public"."achievements" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can delete their own budgets" ON "public"."budgets" FOR DELETE USING (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can delete their own daily_entries" ON "public"."daily_entries" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can delete their own folders" ON "public"."folders" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can delete their own lovable_accounts" ON "public"."lovable_accounts" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can delete their own notes" ON "public"."notes" FOR DELETE USING (("user_id" = "auth"."uid"()))
CREATE POLICY "Users can delete their own pomodoro sessions" ON "public"."pomodoro_sessions" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can delete their own pomodoro settings" ON "public"."pomodoro_settings" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can delete their own profiles" ON "public"."profiles" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can delete their own projects" ON "public"."projects" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can delete their own task projects" ON "public"."task_projects" FOR DELETE USING (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can delete their own tasks" ON "public"."tasks" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can delete their own time_entries" ON "public"."time_entries" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can delete their own transactions" ON "public"."budget_transactions" FOR DELETE USING (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can delete their own usage_logs" ON "public"."usage_logs" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can insert their own achievements" ON "public"."achievements" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can insert their own daily_entries" ON "public"."daily_entries" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can insert their own folders" ON "public"."folders" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can insert their own lovable_accounts" ON "public"."lovable_accounts" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can insert their own pomodoro sessions" ON "public"."pomodoro_sessions" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can insert their own pomodoro settings" ON "public"."pomodoro_settings" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can insert their own profiles" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can insert their own projects" ON "public"."projects" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can insert their own prompts" ON "public"."notes" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can insert their own task projects" ON "public"."task_projects" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can insert their own tasks" ON "public"."tasks" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can insert their own time_entries" ON "public"."time_entries" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can insert their own transactions" ON "public"."budget_transactions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can insert their own usage_logs" ON "public"."usage_logs" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can update their own account usage logs" ON "public"."account_usage_logs" FOR UPDATE USING (("user_id" = "auth"."uid"()))
CREATE POLICY "Users can update their own accounts" ON "public"."accounts" FOR UPDATE USING (("user_id" = "auth"."uid"()))
CREATE POLICY "Users can update their own achievements" ON "public"."achievements" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can update their own budgets" ON "public"."budgets" FOR UPDATE USING (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can update their own daily_entries" ON "public"."daily_entries" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can update their own folders" ON "public"."folders" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can update their own lovable_accounts" ON "public"."lovable_accounts" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can update their own notes" ON "public"."notes" FOR UPDATE USING (("user_id" = "auth"."uid"()))
CREATE POLICY "Users can update their own pomodoro sessions" ON "public"."pomodoro_sessions" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can update their own pomodoro settings" ON "public"."pomodoro_settings" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can update their own profiles" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can update their own projects" ON "public"."projects" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can update their own task projects" ON "public"."task_projects" FOR UPDATE USING (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can update their own tasks" ON "public"."tasks" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can update their own time_entries" ON "public"."time_entries" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can update their own transactions" ON "public"."budget_transactions" FOR UPDATE USING (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can update their own usage_logs" ON "public"."usage_logs" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can view their own account usage logs" ON "public"."account_usage_logs" FOR SELECT USING (("user_id" = "auth"."uid"()))
CREATE POLICY "Users can view their own accounts" ON "public"."accounts" FOR SELECT USING (("user_id" = "auth"."uid"()))
CREATE POLICY "Users can view their own achievements" ON "public"."achievements" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can view their own budgets" ON "public"."budgets" FOR SELECT USING (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can view their own daily_entries" ON "public"."daily_entries" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can view their own folders" ON "public"."folders" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can view their own lovable_accounts" ON "public"."lovable_accounts" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can view their own notes" ON "public"."notes" FOR SELECT USING (("user_id" = "auth"."uid"()))
CREATE POLICY "Users can view their own pomodoro sessions" ON "public"."pomodoro_sessions" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can view their own pomodoro settings" ON "public"."pomodoro_settings" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can view their own profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can view their own projects" ON "public"."projects" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can view their own task projects" ON "public"."task_projects" FOR SELECT USING (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can view their own tasks" ON "public"."tasks" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can view their own time_entries" ON "public"."time_entries" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
CREATE POLICY "Users can view their own transactions" ON "public"."budget_transactions" FOR SELECT USING (("auth"."uid"() = "user_id"))
CREATE POLICY "Users can view their own usage_logs" ON "public"."usage_logs" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"))
ALTER TABLE "public"."account_usage_logs" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."accounts" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."achievements" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."budget_transactions" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."budgets" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."daily_entries" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."folders" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."lovable_accounts" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."notes" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."pomodoro_sessions" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."pomodoro_settings" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."task_projects" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."time_entries" ENABLE ROW LEVEL SECURITY
ALTER TABLE "public"."usage_logs" ENABLE ROW LEVEL SECURITY
ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres"
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."budgets"
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."folders"
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."lovable_accounts"
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."notes"
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."pomodoro_sessions"
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."pomodoro_settings"
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."tasks"
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."usage_logs"
GRANT USAGE ON SCHEMA "public" TO "postgres"
GRANT USAGE ON SCHEMA "public" TO "anon"
GRANT USAGE ON SCHEMA "public" TO "authenticated"
GRANT USAGE ON SCHEMA "public" TO "service_role"
GRANT ALL ON FUNCTION "public"."check_and_create_achievements"("p_user_id" "uuid") TO "anon"
GRANT ALL ON FUNCTION "public"."check_and_create_achievements"("p_user_id" "uuid") TO "authenticated"
GRANT ALL ON FUNCTION "public"."check_and_create_achievements"("p_user_id" "uuid") TO "service_role"
GRANT ALL ON FUNCTION "public"."create_daily_entry"("p_user_id" "uuid", "p_date" "date", "p_title" "text", "p_description" "text", "p_category" "text", "p_value" integer, "p_unit" "text", "p_mood" "text", "p_notes" "text", "p_tags" "text"[], "p_goal_id" "uuid") TO "anon"
GRANT ALL ON FUNCTION "public"."create_daily_entry"("p_user_id" "uuid", "p_date" "date", "p_title" "text", "p_description" "text", "p_category" "text", "p_value" integer, "p_unit" "text", "p_mood" "text", "p_notes" "text", "p_tags" "text"[], "p_goal_id" "uuid") TO "authenticated"
GRANT ALL ON FUNCTION "public"."create_daily_entry"("p_user_id" "uuid", "p_date" "date", "p_title" "text", "p_description" "text", "p_category" "text", "p_value" integer, "p_unit" "text", "p_mood" "text", "p_notes" "text", "p_tags" "text"[], "p_goal_id" "uuid") TO "service_role"
GRANT ALL ON FUNCTION "public"."create_daily_entry_with_project"("p_user_id" "uuid", "p_date" "date", "p_title" "text", "p_description" "text", "p_category" "text", "p_mood" "text", "p_notes" "text", "p_tags" "text"[], "p_goal_id" "uuid", "p_project_id" "uuid") TO "anon"
GRANT ALL ON FUNCTION "public"."create_daily_entry_with_project"("p_user_id" "uuid", "p_date" "date", "p_title" "text", "p_description" "text", "p_category" "text", "p_mood" "text", "p_notes" "text", "p_tags" "text"[], "p_goal_id" "uuid", "p_project_id" "uuid") TO "authenticated"
GRANT ALL ON FUNCTION "public"."create_daily_entry_with_project"("p_user_id" "uuid", "p_date" "date", "p_title" "text", "p_description" "text", "p_category" "text", "p_mood" "text", "p_notes" "text", "p_tags" "text"[], "p_goal_id" "uuid", "p_project_id" "uuid") TO "service_role"
GRANT ALL ON FUNCTION "public"."create_goal"("p_user_id" "uuid", "p_title" "text", "p_description" "text", "p_type" "text", "p_priority" "text", "p_target_value" integer, "p_unit" "text", "p_start_date" "date", "p_target_date" "date", "p_category" "text", "p_tags" "text"[], "p_project_id" "text", "p_task_ids" "uuid"[]) TO "anon"
GRANT ALL ON FUNCTION "public"."create_goal"("p_user_id" "uuid", "p_title" "text", "p_description" "text", "p_type" "text", "p_priority" "text", "p_target_value" integer, "p_unit" "text", "p_start_date" "date", "p_target_date" "date", "p_category" "text", "p_tags" "text"[], "p_project_id" "text", "p_task_ids" "uuid"[]) TO "authenticated"
GRANT ALL ON FUNCTION "public"."create_goal"("p_user_id" "uuid", "p_title" "text", "p_description" "text", "p_type" "text", "p_priority" "text", "p_target_value" integer, "p_unit" "text", "p_start_date" "date", "p_target_date" "date", "p_category" "text", "p_tags" "text"[], "p_project_id" "text", "p_task_ids" "uuid"[]) TO "service_role"
GRANT ALL ON FUNCTION "public"."create_goal_with_project"("p_user_id" "uuid", "p_title" "text", "p_description" "text", "p_type" "text", "p_priority" "text", "p_start_date" "date", "p_target_date" "date", "p_category" "text", "p_tags" "text"[], "p_project_uuid" "uuid", "p_task_ids" "uuid"[]) TO "anon"
GRANT ALL ON FUNCTION "public"."create_goal_with_project"("p_user_id" "uuid", "p_title" "text", "p_description" "text", "p_type" "text", "p_priority" "text", "p_start_date" "date", "p_target_date" "date", "p_category" "text", "p_tags" "text"[], "p_project_uuid" "uuid", "p_task_ids" "uuid"[]) TO "authenticated"
GRANT ALL ON FUNCTION "public"."create_goal_with_project"("p_user_id" "uuid", "p_title" "text", "p_description" "text", "p_type" "text", "p_priority" "text", "p_start_date" "date", "p_target_date" "date", "p_category" "text", "p_tags" "text"[], "p_project_uuid" "uuid", "p_task_ids" "uuid"[]) TO "service_role"
GRANT ALL ON FUNCTION "public"."create_project"("p_user_id" "uuid", "p_name" "text", "p_description" "text", "p_color" "text", "p_priority" "text", "p_start_date" "date", "p_target_date" "date", "p_tags" "text"[]) TO "anon"
GRANT ALL ON FUNCTION "public"."create_project"("p_user_id" "uuid", "p_name" "text", "p_description" "text", "p_color" "text", "p_priority" "text", "p_start_date" "date", "p_target_date" "date", "p_tags" "text"[]) TO "authenticated"
GRANT ALL ON FUNCTION "public"."create_project"("p_user_id" "uuid", "p_name" "text", "p_description" "text", "p_color" "text", "p_priority" "text", "p_start_date" "date", "p_target_date" "date", "p_tags" "text"[]) TO "service_role"
GRANT ALL ON FUNCTION "public"."get_goal_analytics"("p_user_id" "uuid") TO "anon"
GRANT ALL ON FUNCTION "public"."get_goal_analytics"("p_user_id" "uuid") TO "authenticated"
GRANT ALL ON FUNCTION "public"."get_goal_analytics"("p_user_id" "uuid") TO "service_role"
GRANT ALL ON FUNCTION "public"."get_project_details"("p_project_id" "uuid", "p_user_id" "uuid") TO "anon"
GRANT ALL ON FUNCTION "public"."get_project_details"("p_project_id" "uuid", "p_user_id" "uuid") TO "authenticated"
GRANT ALL ON FUNCTION "public"."get_project_details"("p_project_id" "uuid", "p_user_id" "uuid") TO "service_role"
GRANT ALL ON FUNCTION "public"."get_user_achievements"("p_user_id" "uuid") TO "anon"
GRANT ALL ON FUNCTION "public"."get_user_achievements"("p_user_id" "uuid") TO "authenticated"
GRANT ALL ON FUNCTION "public"."get_user_achievements"("p_user_id" "uuid") TO "service_role"
GRANT ALL ON FUNCTION "public"."get_user_daily_entries"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "anon"
GRANT ALL ON FUNCTION "public"."get_user_daily_entries"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "authenticated"
GRANT ALL ON FUNCTION "public"."get_user_daily_entries"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "service_role"
GRANT ALL ON FUNCTION "public"."get_user_goals"("p_user_id" "uuid", "p_status" "text", "p_type" "text") TO "anon"
GRANT ALL ON FUNCTION "public"."get_user_goals"("p_user_id" "uuid", "p_status" "text", "p_type" "text") TO "authenticated"
GRANT ALL ON FUNCTION "public"."get_user_goals"("p_user_id" "uuid", "p_status" "text", "p_type" "text") TO "service_role"
GRANT ALL ON FUNCTION "public"."get_user_goals_with_projects"("p_user_id" "uuid", "p_status" "text", "p_type" "text", "p_project_id" "uuid") TO "anon"
GRANT ALL ON FUNCTION "public"."get_user_goals_with_projects"("p_user_id" "uuid", "p_status" "text", "p_type" "text", "p_project_id" "uuid") TO "authenticated"
GRANT ALL ON FUNCTION "public"."get_user_goals_with_projects"("p_user_id" "uuid", "p_status" "text", "p_type" "text", "p_project_id" "uuid") TO "service_role"
GRANT ALL ON FUNCTION "public"."get_user_projects"("p_user_id" "uuid") TO "anon"
GRANT ALL ON FUNCTION "public"."get_user_projects"("p_user_id" "uuid") TO "authenticated"
GRANT ALL ON FUNCTION "public"."get_user_projects"("p_user_id" "uuid") TO "service_role"
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon"
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated"
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role"
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon"
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated"
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role"
GRANT ALL ON FUNCTION "public"."trigger_check_achievements"() TO "anon"
GRANT ALL ON FUNCTION "public"."trigger_check_achievements"() TO "authenticated"
GRANT ALL ON FUNCTION "public"."trigger_check_achievements"() TO "service_role"
GRANT ALL ON FUNCTION "public"."trigger_update_goal_progress"() TO "anon"
GRANT ALL ON FUNCTION "public"."trigger_update_goal_progress"() TO "authenticated"
GRANT ALL ON FUNCTION "public"."trigger_update_goal_progress"() TO "service_role"
GRANT ALL ON FUNCTION "public"."trigger_update_task_total_time"() TO "anon"
GRANT ALL ON FUNCTION "public"."trigger_update_task_total_time"() TO "authenticated"
GRANT ALL ON FUNCTION "public"."trigger_update_task_total_time"() TO "service_role"
GRANT ALL ON FUNCTION "public"."update_accounts_updated_at"() TO "anon"
GRANT ALL ON FUNCTION "public"."update_accounts_updated_at"() TO "authenticated"
GRANT ALL ON FUNCTION "public"."update_accounts_updated_at"() TO "service_role"
GRANT ALL ON FUNCTION "public"."update_budget_spent"("p_budget_id" "uuid", "p_amount" numeric) TO "anon"
GRANT ALL ON FUNCTION "public"."update_budget_spent"("p_budget_id" "uuid", "p_amount" numeric) TO "authenticated"
GRANT ALL ON FUNCTION "public"."update_budget_spent"("p_budget_id" "uuid", "p_amount" numeric) TO "service_role"
GRANT ALL ON FUNCTION "public"."update_goal_progress"("goal_uuid" "uuid") TO "anon"
GRANT ALL ON FUNCTION "public"."update_goal_progress"("goal_uuid" "uuid") TO "authenticated"
GRANT ALL ON FUNCTION "public"."update_goal_progress"("goal_uuid" "uuid") TO "service_role"
GRANT ALL ON FUNCTION "public"."update_goal_status"("p_goal_id" "uuid", "p_status" "text", "p_completion_date" "date") TO "anon"
GRANT ALL ON FUNCTION "public"."update_goal_status"("p_goal_id" "uuid", "p_status" "text", "p_completion_date" "date") TO "authenticated"
GRANT ALL ON FUNCTION "public"."update_goal_status"("p_goal_id" "uuid", "p_status" "text", "p_completion_date" "date") TO "service_role"
GRANT ALL ON FUNCTION "public"."update_task_projects_updated_at"() TO "anon"
GRANT ALL ON FUNCTION "public"."update_task_projects_updated_at"() TO "authenticated"
GRANT ALL ON FUNCTION "public"."update_task_projects_updated_at"() TO "service_role"
GRANT ALL ON FUNCTION "public"."update_task_total_time"("task_uuid" "uuid") TO "anon"
GRANT ALL ON FUNCTION "public"."update_task_total_time"("task_uuid" "uuid") TO "authenticated"
GRANT ALL ON FUNCTION "public"."update_task_total_time"("task_uuid" "uuid") TO "service_role"
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon"
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated"
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role"
GRANT ALL ON FUNCTION "public"."your_trigger_function"() TO "anon"
GRANT ALL ON FUNCTION "public"."your_trigger_function"() TO "authenticated"
GRANT ALL ON FUNCTION "public"."your_trigger_function"() TO "service_role"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."account_usage_logs" TO "anon"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."account_usage_logs" TO "authenticated"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."account_usage_logs" TO "service_role"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."accounts" TO "anon"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."accounts" TO "authenticated"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."accounts" TO "service_role"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."achievements" TO "anon"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."achievements" TO "authenticated"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."achievements" TO "service_role"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."budget_transactions" TO "anon"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."budget_transactions" TO "authenticated"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."budget_transactions" TO "service_role"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."budgets" TO "anon"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."budgets" TO "authenticated"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."budgets" TO "service_role"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."daily_entries" TO "anon"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."daily_entries" TO "authenticated"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."daily_entries" TO "service_role"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."folders" TO "anon"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."folders" TO "authenticated"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."folders" TO "service_role"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."lovable_accounts" TO "anon"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."lovable_accounts" TO "authenticated"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."lovable_accounts" TO "service_role"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."notes" TO "anon"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."notes" TO "authenticated"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."notes" TO "service_role"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."pomodoro_sessions" TO "anon"
GRANT ALL ON TABLE "public"."pomodoro_sessions" TO "authenticated"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."pomodoro_sessions" TO "service_role"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."pomodoro_settings" TO "anon"
GRANT ALL ON TABLE "public"."pomodoro_settings" TO "authenticated"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."pomodoro_settings" TO "service_role"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."profiles" TO "anon"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."profiles" TO "authenticated"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."profiles" TO "service_role"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."projects" TO "anon"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."projects" TO "authenticated"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."projects" TO "service_role"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."task_projects" TO "anon"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."task_projects" TO "authenticated"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."task_projects" TO "service_role"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tasks" TO "anon"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tasks" TO "authenticated"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tasks" TO "service_role"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."time_entries" TO "anon"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."time_entries" TO "authenticated"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."time_entries" TO "service_role"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."usage_logs" TO "anon"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."usage_logs" TO "authenticated"
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."usage_logs" TO "service_role"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "postgres"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "anon"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "authenticated"
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "service_role"
drop extension if exists "pg_net"
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()