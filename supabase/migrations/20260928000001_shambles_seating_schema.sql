-- ====================================================================
-- SHAMBLES SEATING: VERSIONED DATABASE MIGRATION
-- Migration: 20260928000001_shambles_seating_schema.sql
-- Domain: Smart Event RSVP, Capacity Enforcement & Deterministic Waitlist
-- Event: Frontend Roulette 1.0 (Gran Tesoro / Reverie Summit Theme)
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing schema if re-running
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ====================================================================
-- 1. ENUMS & DOMAIN TYPES
-- ====================================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('participant', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE registration_status AS ENUM (
        'PENDING',
        'CONFIRMED',
        'WAITLISTED',
        'OFFERED',
        'CANCELLED',
        'EXPIRED',
        'SKIPPED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE offer_status AS ENUM (
        'ACTIVE',
        'CLAIMED',
        'EXPIRED',
        'DECLINED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ====================================================================
-- 2. CORE TABLES
-- ====================================================================

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    college_id TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'participant',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- EVENTS
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue TEXT NOT NULL,
    capacity INT NOT NULL DEFAULT 50 CHECK (capacity > 0),
    status TEXT NOT NULL DEFAULT 'UPCOMING',
    theme TEXT NOT NULL DEFAULT 'Gran Tesoro VIP Gala',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- REGISTRATIONS
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    crew_name TEXT NOT NULL,
    captain_name TEXT NOT NULL,
    captain_email TEXT NOT NULL,
    captain_phone TEXT NOT NULL,
    college_id TEXT NOT NULL,
    crew_size INT NOT NULL CHECK (crew_size BETWEEN 3 AND 4),
    status registration_status NOT NULL DEFAULT 'PENDING',
    queue_position INT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

-- CREW MEMBERS
CREATE TABLE IF NOT EXISTS public.crew_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    college_id TEXT,
    role TEXT NOT NULL DEFAULT 'Crew Member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- BERTH OFFERS (10-minute temporary claim rights)
CREATE TABLE IF NOT EXISTS public.berth_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + INTERVAL '10 minutes'),
    status offer_status NOT NULL DEFAULT 'ACTIVE',
    claimed_at TIMESTAMPTZ,
    expired_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ
);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    registration_id UUID REFERENCES public.registrations(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 3. INDEXES & CONSTRAINTS (STRICT CONCURRENCY & INTEGRITY)
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_registrations_event_status ON public.registrations (event_id, status);
CREATE INDEX IF NOT EXISTS idx_registrations_queue ON public.registrations (event_id, queue_position) WHERE status = 'WAITLISTED';
CREATE INDEX IF NOT EXISTS idx_registrations_order ON public.registrations (event_id, created_at, id) WHERE status = 'WAITLISTED';
CREATE INDEX IF NOT EXISTS idx_berth_offers_active ON public.berth_offers (event_id, status, expires_at) WHERE status = 'ACTIVE';

-- 1. There must NEVER be more than one active berth offer for the same event
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_offer_per_event
ON public.berth_offers (event_id)
WHERE status = 'ACTIVE';

-- 2. There must NEVER be duplicate active offers for the same registration
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_offer_per_reg
ON public.berth_offers (registration_id)
WHERE status = 'ACTIVE';

-- 3. Ensure queue positions are unique within the waitlist
CREATE UNIQUE INDEX IF NOT EXISTS unique_queue_pos_per_event
ON public.registrations (event_id, queue_position)
WHERE status = 'WAITLISTED' AND queue_position IS NOT NULL;

-- ====================================================================
-- 4. REALTIME REPLICATION CONFIGURATION
-- ====================================================================
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER TABLE public.registrations REPLICA IDENTITY FULL;
ALTER TABLE public.berth_offers REPLICA IDENTITY FULL;
ALTER TABLE public.audit_logs REPLICA IDENTITY FULL;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.events, public.registrations, public.berth_offers, public.audit_logs;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ====================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berth_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users see and update their own, Admins see all
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Events: Everyone can read, only admin can update
CREATE POLICY "Events are viewable by everyone" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify events" ON public.events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Registrations: Public aggregate counts / Authenticated user reads own / Admin reads all
CREATE POLICY "Participants view own registration or public list" ON public.registrations
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create registration" ON public.registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Admins can update registrations directly" ON public.registrations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Crew members: viewable by everyone, insertable by registration owner
CREATE POLICY "Crew members viewable by all" ON public.crew_members
    FOR SELECT USING (true);

CREATE POLICY "Registration owner can insert crew members" ON public.crew_members
    FOR INSERT WITH CHECK (true);

-- Berth Offers: Viewable by everyone for queue transparency, modifiable via functions
CREATE POLICY "Offers viewable by participants and admin" ON public.berth_offers
    FOR SELECT USING (true);

-- Audit logs: Read-only for admins and event auditors
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- ====================================================================
-- 6. ATOMIC BUSINESS LOGIC FUNCTIONS (SECURITY DEFINER)
-- ====================================================================

-- A. Auto-create profile upon auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, college_id, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Voyager'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'college_id', 'UNREGISTERED'),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'participant')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- B. Authoritative Deterministic Queue Recalculation
-- Authoritative ordering: created_at ASC, id ASC
CREATE OR REPLACE FUNCTION public.reorder_waitlist_queue(p_event_id UUID)
RETURNS VOID AS $$
BEGIN
    WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS new_pos
        FROM public.registrations
        WHERE event_id = p_event_id AND status = 'WAITLISTED'
    )
    UPDATE public.registrations r
    SET queue_position = ranked.new_pos,
        updated_at = timezone('utc'::text, now())
    FROM ranked
    WHERE r.id = ranked.id AND (r.queue_position IS DISTINCT FROM ranked.new_pos);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- C. Promote Next Waitlisted Crew
-- Capacity-changing operation: locks the event row first
CREATE OR REPLACE FUNCTION public.promote_next_waitlist_crew(p_event_id UUID)
RETURNS UUID AS $$
DECLARE
    v_event RECORD;
    v_next_reg RECORD;
    v_offer_id UUID;
    v_active_offers_count INT;
    v_confirmed_count INT;
    v_available_slots INT;
BEGIN
    -- 1. SERIALIZE BY LOCKING THE EVENT ROW
    SELECT * INTO v_event FROM public.events WHERE id = p_event_id FOR UPDATE;
    IF v_event.id IS NULL THEN
        RAISE EXCEPTION 'Event not found';
    END IF;

    -- 2. Check if an active offer already exists for this event
    SELECT COUNT(*) INTO v_active_offers_count 
    FROM public.berth_offers
    WHERE event_id = p_event_id AND status = 'ACTIVE' AND expires_at > timezone('utc'::text, now());

    IF v_active_offers_count > 0 THEN
        -- An active offer is already underway for this event
        RETURN NULL;
    END IF;

    -- 3. Calculate confirmed registrations while holding event lock
    SELECT COUNT(*) INTO v_confirmed_count 
    FROM public.registrations
    WHERE event_id = p_event_id AND status = 'CONFIRMED';

    v_available_slots := v_event.capacity - v_confirmed_count;

    IF v_available_slots <= 0 THEN
        RETURN NULL; -- No released berth to offer
    END IF;

    -- 4. Select top eligible waitlisted registration by authoritative order
    SELECT * INTO v_next_reg 
    FROM public.registrations
    WHERE event_id = p_event_id AND status = 'WAITLISTED'
    ORDER BY created_at ASC, id ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF v_next_reg.id IS NULL THEN
        RETURN NULL; -- Waitlist is empty
    END IF;

    -- 5. Transition registration status to OFFERED
    UPDATE public.registrations
    SET status = 'OFFERED',
        queue_position = NULL,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_next_reg.id;

    -- 6. Create exactly ONE active berth offer for the event
    INSERT INTO public.berth_offers (
        event_id,
        registration_id,
        created_at,
        expires_at,
        status
    ) VALUES (
        p_event_id,
        v_next_reg.id,
        timezone('utc'::text, now()),
        timezone('utc'::text, now()) + INTERVAL '10 minutes',
        'ACTIVE'
    ) RETURNING id INTO v_offer_id;

    -- 7. Transactionally recalculate queue positions for remaining waitlisted crews
    PERFORM public.reorder_waitlist_queue(p_event_id);

    -- 8. Write audit log
    INSERT INTO public.audit_logs (event_id, registration_id, type, message, metadata)
    VALUES (
        p_event_id,
        v_next_reg.id,
        'BERTH_OFFER_EXTENDED',
        'A released berth has been extended to crew ' || v_next_reg.crew_name || ' with a 10-minute claim window.',
        jsonb_build_object(
            'offer_id', v_offer_id,
            'crew_name', v_next_reg.crew_name,
            'captain_email', v_next_reg.captain_email,
            'expires_at', (timezone('utc'::text, now()) + INTERVAL '10 minutes')
        )
    );

    RETURN v_offer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- D. Claim Berth Offer
-- Locks the event row and the offer row
CREATE OR REPLACE FUNCTION public.claim_berth_offer(p_offer_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_offer RECORD;
    v_reg RECORD;
    v_event RECORD;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
    SELECT * INTO v_offer FROM public.berth_offers WHERE id = p_offer_id FOR UPDATE;

    IF v_offer.id IS NULL THEN
        RAISE EXCEPTION 'Offer does not exist.';
    END IF;

    -- SERIALIZE BY LOCKING THE EVENT ROW
    SELECT * INTO v_event FROM public.events WHERE id = v_offer.event_id FOR UPDATE;

    IF v_offer.status <> 'ACTIVE' THEN
        RAISE EXCEPTION 'Offer is no longer active (status: %)', v_offer.status;
    END IF;

    IF v_now >= v_offer.expires_at THEN
        -- Mark as expired and cascade promotion
        UPDATE public.berth_offers SET status = 'EXPIRED', expired_at = v_now WHERE id = v_offer.id;
        UPDATE public.registrations SET status = 'EXPIRED', updated_at = v_now WHERE id = v_offer.registration_id;
        PERFORM public.promote_next_waitlist_crew(v_offer.event_id);
        RAISE EXCEPTION 'Claim window expired at %', v_offer.expires_at;
    END IF;

    SELECT * INTO v_reg FROM public.registrations WHERE id = v_offer.registration_id;

    -- Atomically claim offer and confirm registration
    UPDATE public.berth_offers
    SET status = 'CLAIMED', claimed_at = v_now
    WHERE id = v_offer.id;

    UPDATE public.registrations
    SET status = 'CONFIRMED',
        confirmed_at = v_now,
        queue_position = NULL,
        updated_at = v_now
    WHERE id = v_offer.registration_id;

    -- Audit log
    INSERT INTO public.audit_logs (event_id, registration_id, type, message, metadata)
    VALUES (
        v_offer.event_id,
        v_offer.registration_id,
        'BERTH_CLAIMED',
        'Berth successfully secured by crew ' || v_reg.crew_name || '.',
        jsonb_build_object('offer_id', p_offer_id, 'claimed_at', v_now)
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- E. Abandon Voyage (Participant / Admin Cancellation)
-- Locks event row to serialize capacity release and cascade promotion
CREATE OR REPLACE FUNCTION public.abandon_voyage(p_registration_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_reg RECORD;
    v_event RECORD;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
    SELECT * INTO v_reg FROM public.registrations WHERE id = p_registration_id FOR UPDATE;

    IF v_reg.id IS NULL THEN
        RAISE EXCEPTION 'Registration not found.';
    END IF;

    IF v_reg.status NOT IN ('CONFIRMED', 'WAITLISTED', 'OFFERED') THEN
        RAISE EXCEPTION 'Cannot cancel registration with status %', v_reg.status;
    END IF;

    -- Lock event row
    SELECT * INTO v_event FROM public.events WHERE id = v_reg.event_id FOR UPDATE;

    -- If cancelling an offered berth, cancel the offer
    IF v_reg.status = 'OFFERED' THEN
        UPDATE public.berth_offers
        SET status = 'CANCELLED'
        WHERE registration_id = p_registration_id AND status = 'ACTIVE';
    END IF;

    -- Mark registration as CANCELLED
    UPDATE public.registrations
    SET status = 'CANCELLED',
        cancelled_at = v_now,
        queue_position = NULL,
        updated_at = v_now
    WHERE id = p_registration_id;

    -- Recalculate queue if this was a waitlisted user
    IF v_reg.status = 'WAITLISTED' THEN
        PERFORM public.reorder_waitlist_queue(v_reg.event_id);
    END IF;

    -- Audit log
    INSERT INTO public.audit_logs (event_id, registration_id, type, message, metadata)
    VALUES (
        v_reg.event_id,
        p_registration_id,
        'VOYAGE_ABANDONED',
        'Crew ' || v_reg.crew_name || ' abandoned their voyage. Capacity released.',
        jsonb_build_object('previous_status', v_reg.status, 'cancelled_at', v_now)
    );

    -- If a confirmed or offered berth was freed, promote the next waitlisted crew!
    IF v_reg.status IN ('CONFIRMED', 'OFFERED') THEN
        PERFORM public.promote_next_waitlist_crew(v_reg.event_id);
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- F. Expire Berth Offer (Called by Admin or Cron Worker)
CREATE OR REPLACE FUNCTION public.expire_berth_offer(p_offer_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_offer RECORD;
    v_reg RECORD;
    v_event RECORD;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
    SELECT * INTO v_offer FROM public.berth_offers WHERE id = p_offer_id FOR UPDATE;

    IF v_offer.id IS NULL OR v_offer.status <> 'ACTIVE' THEN
        RETURN FALSE;
    END IF;

    -- Lock event row
    SELECT * INTO v_event FROM public.events WHERE id = v_offer.event_id FOR UPDATE;
    SELECT * INTO v_reg FROM public.registrations WHERE id = v_offer.registration_id;

    UPDATE public.berth_offers
    SET status = 'EXPIRED', expired_at = v_now
    WHERE id = v_offer.id;

    UPDATE public.registrations
    SET status = 'EXPIRED', updated_at = v_now
    WHERE id = v_offer.registration_id;

    INSERT INTO public.audit_logs (event_id, registration_id, type, message, metadata)
    VALUES (
        v_offer.event_id,
        v_offer.registration_id,
        'BERTH_OFFER_EXPIRED',
        '10-minute claim window lapsed for crew ' || v_reg.crew_name || '. Offer expired.',
        jsonb_build_object('offer_id', p_offer_id, 'expired_at', v_now)
    );

    -- Cascade promotion to next eligible waitlisted crew
    PERFORM public.promote_next_waitlist_crew(v_offer.event_id);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- G. Periodic / Background Expiry Engine
CREATE OR REPLACE FUNCTION public.process_expired_offers()
RETURNS INT AS $$
DECLARE
    r RECORD;
    v_count INT := 0;
BEGIN
    FOR r IN (
        SELECT id FROM public.berth_offers
        WHERE status = 'ACTIVE' AND expires_at <= timezone('utc'::text, now())
    ) LOOP
        IF public.expire_berth_offer(r.id) THEN
            v_count := v_count + 1;
        END IF;
    END LOOP;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- H. Register Crew RSVP
CREATE OR REPLACE FUNCTION public.register_crew(
    p_event_id UUID,
    p_crew_name TEXT,
    p_captain_name TEXT,
    p_captain_email TEXT,
    p_captain_phone TEXT,
    p_college_id TEXT,
    p_crew_size INT,
    p_members JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB AS $$
DECLARE
    v_event RECORD;
    v_confirmed_count INT;
    v_active_offers_count INT;
    v_available_slots INT;
    v_status registration_status;
    v_queue_pos INT := NULL;
    v_reg_id UUID;
    v_user_id UUID := auth.uid();
    v_member JSONB;
BEGIN
    -- 1. SERIALIZE BY LOCKING THE EVENT ROW
    SELECT * INTO v_event FROM public.events WHERE id = p_event_id FOR UPDATE;
    IF v_event.id IS NULL THEN
        RAISE EXCEPTION 'Event not found';
    END IF;

    -- 2. Calculate confirmed registrations under event lock
    SELECT COUNT(*) INTO v_confirmed_count FROM public.registrations
    WHERE event_id = p_event_id AND status = 'CONFIRMED';

    SELECT COUNT(*) INTO v_active_offers_count FROM public.berth_offers
    WHERE event_id = p_event_id AND status = 'ACTIVE' AND expires_at > timezone('utc'::text, now());

    v_available_slots := v_event.capacity - (v_confirmed_count + v_active_offers_count);

    IF v_available_slots > 0 THEN
        v_status := 'CONFIRMED';
    ELSE
        v_status := 'WAITLISTED';
    END IF;

    -- Insert registration
    INSERT INTO public.registrations (
        event_id,
        user_id,
        crew_name,
        captain_name,
        captain_email,
        captain_phone,
        college_id,
        crew_size,
        status,
        queue_position,
        confirmed_at
    ) VALUES (
        p_event_id,
        v_user_id,
        p_crew_name,
        p_captain_name,
        p_captain_email,
        p_captain_phone,
        p_college_id,
        p_crew_size,
        v_status,
        NULL,
        CASE WHEN v_status = 'CONFIRMED' THEN timezone('utc'::text, now()) ELSE NULL END
    ) RETURNING id INTO v_reg_id;

    -- If waitlisted, recalculate queue authoritatively
    IF v_status = 'WAITLISTED' THEN
        PERFORM public.reorder_waitlist_queue(p_event_id);
        SELECT queue_position INTO v_queue_pos FROM public.registrations WHERE id = v_reg_id;
    END IF;

    -- Insert crew members
    IF p_members IS NOT NULL AND jsonb_array_length(p_members) > 0 THEN
        FOR v_member IN SELECT * FROM jsonb_array_elements(p_members) LOOP
            INSERT INTO public.crew_members (
                registration_id,
                name,
                email,
                college_id,
                role
            ) VALUES (
                v_reg_id,
                v_member->>'name',
                v_member->>'email',
                v_member->>'college_id',
                COALESCE(v_member->>'role', 'Crew Member')
            );
        END LOOP;
    END IF;

    -- Audit log
    INSERT INTO public.audit_logs (event_id, registration_id, type, message, metadata)
    VALUES (
        p_event_id,
        v_reg_id,
        'REGISTRATION_CREATED',
        'Crew ' || p_crew_name || ' registered with status ' || v_status || '.',
        jsonb_build_object(
            'crew_name', p_crew_name,
            'status', v_status,
            'queue_position', v_queue_pos,
            'crew_size', p_crew_size
        )
    );

    RETURN jsonb_build_object(
        'id', v_reg_id,
        'status', v_status,
        'queue_position', v_queue_pos
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- 7. SEED DATA GENERATOR: FRONTEND ROULETTE 1.0 (DEMO RESET)
-- ====================================================================
CREATE OR REPLACE FUNCTION public.reset_demo_event()
RETURNS VOID AS $$
DECLARE
    v_event_id UUID;
    v_reg_id UUID;
    i INT;
    v_waitlist_crews TEXT[] := ARRAY[
        'Grand Line Coders',
        'Devil Fruit Devs',
        'The Lost Poneglyph Files',
        'Bug Hunters',
        'Straw Hat Stack',
        'Void Century Engineers',
        'All Blue Algorists',
        'Loguetown Hackers'
    ];
    v_confirmed_crews TEXT[] := ARRAY[
        'Sunny Go Pioneers', 'Red Force Command', 'Moby Dick Navigators', 'Victoria Punk Raiders',
        'Queen Mama Pirates', 'Nostra Castello Squad', 'Thriller Bark Shadows', 'Polar Tang Submariners',
        'Baratie Sous-Chefs', 'Going Merry Sentinels', 'Sabaody Dispatch', 'Alabasta Sandstorms',
        'Skypiea Dial Makers', 'Water 7 Shipwrights', 'Enies Lobby Breakers', 'Impel Down Escapees',
        'Marineford Vanguard', 'Fishman Island Royals', 'Punk Hazard Chemists', 'Dressrosa Gladiators',
        'Zou Mink Guardians', 'Whole Cake Patissiers', 'Wano Kuni Samurai', 'Onigashima Conquerors',
        'Egghead Automations', 'Elbaf Giants Division', 'Kamusari Hackers', 'Haki Coders',
        'Gomu Gomu Optimizers', 'Ope Ope Surgery Div', 'Gear 5 Innovators', 'Thunder Bagua Devs',
        'Buster Call Silencers', 'Cipher Pol Aegis-9', 'Revolutionary Army Unit', 'Dragon Claw Devs',
        'Blackbeard Tech Raids', 'Cross Guild Syndicate', 'Kuja Warriors', 'Sun Pirates Crew',
        'Germa 66 Synthetics', 'Arlong Park Outlaws', 'Krieg Armada Remnants', 'Black Cat Strategies',
        'Donquixote Cartel', 'Beast Pirates Stampede', 'Big Mom Fleet Command'
    ];
BEGIN
    -- Delete existing demo records
    DELETE FROM public.audit_logs;
    DELETE FROM public.berth_offers;
    DELETE FROM public.crew_members;
    DELETE FROM public.registrations;
    DELETE FROM public.events WHERE slug = 'frontend-roulette-1';

    -- Insert Demo Event: FRONTEND ROULETTE 1.0
    INSERT INTO public.events (
        slug,
        name,
        description,
        date,
        start_time,
        end_time,
        venue,
        capacity,
        status,
        theme
    ) VALUES (
        'frontend-roulette-1',
        'FRONTEND ROULETTE 1.0',
        'The ultimate algorithmic and UI challenge of the Grand Line. 50 berths available for premier pirate developer crews.',
        '2026-09-28',
        '09:30:00',
        '16:10:00',
        'B4 UCRD Seminar Hall',
        50,
        'UPCOMING',
        'Gran Tesoro VIP Gala'
    ) RETURNING id INTO v_event_id;

    -- Seed 47 Confirmed Crews
    FOR i IN 1..47 LOOP
        INSERT INTO public.registrations (
            event_id,
            crew_name,
            captain_name,
            captain_email,
            captain_phone,
            college_id,
            crew_size,
            status,
            queue_position,
            created_at,
            confirmed_at
        ) VALUES (
            v_event_id,
            v_confirmed_crews[i],
            'Captain ' || split_part(v_confirmed_crews[i], ' ', 1),
            lower(replace(v_confirmed_crews[i], ' ', '.')) || '@grandline.edu',
            '+91 98765 ' || lpad(i::text, 5, '0'),
            'COL-2026-' || lpad(i::text, 3, '0'),
            CASE WHEN i % 2 = 0 THEN 4 ELSE 3 END,
            'CONFIRMED',
            NULL,
            timezone('utc'::text, now()) - ((50 - i) || ' hours')::interval,
            timezone('utc'::text, now()) - ((50 - i) || ' hours')::interval
        ) RETURNING id INTO v_reg_id;

        INSERT INTO public.crew_members (registration_id, name, email, college_id, role)
        VALUES 
            (v_reg_id, 'Captain ' || split_part(v_confirmed_crews[i], ' ', 1), lower(replace(v_confirmed_crews[i], ' ', '.')) || '@grandline.edu', 'COL-2026-' || lpad(i::text, 3, '0'), 'Captain'),
            (v_reg_id, 'Navigator ' || i, 'nav.' || i || '@grandline.edu', 'COL-2026-N' || i, 'First Mate'),
            (v_reg_id, 'Architect ' || i, 'arch.' || i || '@grandline.edu', 'COL-2026-A' || i, 'Specialist');
    END LOOP;

    -- Seed 8 Waitlisted Crews
    FOR i IN 1..8 LOOP
        INSERT INTO public.registrations (
            event_id,
            crew_name,
            captain_name,
            captain_email,
            captain_phone,
            college_id,
            crew_size,
            status,
            queue_position,
            created_at
        ) VALUES (
            v_event_id,
            v_waitlist_crews[i],
            'Leader ' || split_part(v_waitlist_crews[i], ' ', 1),
            lower(replace(v_waitlist_crews[i], ' ', '.')) || '@waitlist.edu',
            '+91 91234 ' || lpad(i::text, 5, '0'),
            'COL-WAIT-' || lpad(i::text, 3, '0'),
            4,
            'WAITLISTED',
            i,
            timezone('utc'::text, now()) - ((10 - i) || ' minutes')::interval
        ) RETURNING id INTO v_reg_id;

        INSERT INTO public.crew_members (registration_id, name, email, college_id, role)
        VALUES 
            (v_reg_id, 'Leader ' || split_part(v_waitlist_crews[i], ' ', 1), lower(replace(v_waitlist_crews[i], ' ', '.')) || '@waitlist.edu', 'COL-WAIT-' || lpad(i::text, 3, '0'), 'Captain'),
            (v_reg_id, 'Engineer ' || i, 'eng.' || i || '@waitlist.edu', 'COL-WAIT-E' || i, 'First Mate'),
            (v_reg_id, 'Designer ' || i, 'des.' || i || '@waitlist.edu', 'COL-WAIT-D' || i, 'Specialist');
    END LOOP;

    -- Recalculate queue authoritatively
    PERFORM public.reorder_waitlist_queue(v_event_id);

    -- Initial Audit Log
    INSERT INTO public.audit_logs (event_id, type, message, metadata)
    VALUES (
        v_event_id,
        'DEMO_INITIALIZED',
        'Frontend Roulette 1.0 initialized with 47 confirmed berths, 3 remaining, and 8 waitlisted crews.',
        jsonb_build_object(
            'capacity', 50,
            'confirmed', 47,
            'available', 3,
            'waitlisted', 8
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute initial demo seed immediately
SELECT public.reset_demo_event();
