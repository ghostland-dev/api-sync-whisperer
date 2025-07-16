-- Create users profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create API providers table
CREATE TABLE public.api_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  category TEXT NOT NULL,
  base_url TEXT,
  auth_type TEXT NOT NULL CHECK (auth_type IN ('api_key', 'oauth', 'bearer', 'basic')),
  documentation_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user API connections table  
CREATE TABLE public.user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.api_providers(id) ON DELETE CASCADE NOT NULL,
  connection_name TEXT NOT NULL,
  credentials JSONB NOT NULL, -- encrypted credentials
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_tested_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'error', 'disconnected')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider_id, connection_name)
);

-- Create integrations/workflows table
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  source_connection_id UUID REFERENCES public.user_connections(id) ON DELETE CASCADE NOT NULL,
  target_connection_id UUID REFERENCES public.user_connections(id) ON DELETE CASCADE NOT NULL,
  trigger_config JSONB NOT NULL, -- webhook, polling, etc
  transformation_config JSONB, -- data mapping rules
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ,
  run_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create integration logs table
CREATE TABLE public.integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'warning')),
  message TEXT,
  data JSONB,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for API providers (public read)
CREATE POLICY "Anyone can view active API providers" ON public.api_providers
FOR SELECT USING (is_active = true);

-- Create RLS policies for user connections
CREATE POLICY "Users can view own connections" ON public.user_connections
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own connections" ON public.user_connections
FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for integrations
CREATE POLICY "Users can view own integrations" ON public.integrations
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own integrations" ON public.integrations
FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for integration logs
CREATE POLICY "Users can view own integration logs" ON public.integration_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.integrations i 
    WHERE i.id = integration_logs.integration_id 
    AND i.user_id = auth.uid()
  )
);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_connections_updated_at
  BEFORE UPDATE ON public.user_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert popular API providers
INSERT INTO public.api_providers (name, description, icon, category, base_url, auth_type, documentation_url) VALUES
('Calendly', 'Synchronisez vos rendez-vous avec vos outils de productivité', '📅', 'Calendrier', 'https://api.calendly.com', 'bearer', 'https://developer.calendly.com/'),
('Notion', 'Automatisez la création de pages et la gestion de bases de données', '📝', 'Productivité', 'https://api.notion.com', 'bearer', 'https://developers.notion.com/'),
('Slack', 'Envoyez des notifications et gérez les conversations', '💬', 'Communication', 'https://slack.com/api', 'bearer', 'https://api.slack.com/'),
('GitHub', 'Automatisez vos workflows de développement', '🔧', 'Développement', 'https://api.github.com', 'bearer', 'https://docs.github.com/en/rest'),
('Stripe', 'Gérez les paiements et les abonnements automatiquement', '💳', 'Paiement', 'https://api.stripe.com', 'bearer', 'https://stripe.com/docs/api'),
('Mailchimp', 'Synchronisez vos contacts et campagnes email', '📧', 'Marketing', 'https://mandrillapp.com/api', 'api_key', 'https://mailchimp.com/developer/'),
('Airtable', 'Gérez vos bases de données et tables', '🗂️', 'Productivité', 'https://api.airtable.com', 'bearer', 'https://airtable.com/developers/web/api/introduction'),
('Trello', 'Automatisez la gestion de projets et tâches', '📋', 'Productivité', 'https://api.trello.com', 'api_key', 'https://developer.atlassian.com/cloud/trello/'),
('Discord', 'Gérez les serveurs et messages Discord', '🎮', 'Communication', 'https://discord.com/api', 'bearer', 'https://discord.com/developers/docs'),
('Google Sheets', 'Synchronisez et automatisez vos feuilles de calcul', '📊', 'Productivité', 'https://sheets.googleapis.com', 'oauth', 'https://developers.google.com/sheets/api');