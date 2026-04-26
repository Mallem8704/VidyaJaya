-- Migration: Prize Money Withdrawal System

-- 1. User Wallets Table
CREATE TABLE IF NOT EXISTS user_wallets (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_earned INTEGER DEFAULT 0, -- in coins
  available_balance INTEGER DEFAULT 0, -- in coins
  withdrawn_amount INTEGER DEFAULT 0, -- in coins
  pending_withdrawal INTEGER DEFAULT 0, -- in coins
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('credit', 'debit')),
  amount INTEGER NOT NULL, -- in coins
  source TEXT, -- 'reward', 'withdrawal_request', 'withdrawal_rejection', etc.
  status TEXT CHECK (status IN ('success', 'pending', 'failed')) DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Withdrawals Table
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- in INR (Rupees)
  upi_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'paid')) DEFAULT 'pending',
  admin_notes TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Users can view their own wallet" ON user_wallets;
CREATE POLICY "Users can view their own wallet" ON user_wallets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own withdrawals" ON withdrawals;
CREATE POLICY "Users can view their own withdrawals" ON withdrawals FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own withdrawals" ON withdrawals;
CREATE POLICY "Users can insert their own withdrawals" ON withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Trigger to create wallet on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_wallets (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 8. Atomic Withdrawal Function
DROP FUNCTION IF EXISTS request_withdrawal(UUID, INTEGER, TEXT, INTEGER);
CREATE OR REPLACE FUNCTION request_withdrawal(
  p_user_id UUID,
  p_amount_inr INTEGER,
  p_upi_id TEXT,
  p_coin_amount INTEGER
) RETURNS VOID AS $$
DECLARE
  v_balance INTEGER;
  v_verified BOOLEAN;
  v_kyc_verified BOOLEAN;
BEGIN
  -- 1. Check verification
  SELECT is_verified, kyc_verified INTO v_verified, v_kyc_verified FROM profiles WHERE id = p_user_id;
  IF NOT v_verified THEN
    RAISE EXCEPTION 'Account must be verified to withdraw';
  END IF;
  IF NOT v_kyc_verified THEN
    RAISE EXCEPTION 'KYC verification required to withdraw';
  END IF;

  -- 2. Check balance
  SELECT available_balance INTO v_balance FROM user_wallets WHERE user_id = p_user_id;
  IF v_balance IS NULL OR v_balance < p_coin_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- 3. Update Wallet
  UPDATE user_wallets 
  SET available_balance = available_balance - p_coin_amount,
      pending_withdrawal = pending_withdrawal + p_coin_amount,
      last_updated = NOW()
  WHERE user_id = p_user_id;

  -- 4. Insert Withdrawal Request
  INSERT INTO withdrawals (user_id, amount, upi_id, status)
  VALUES (p_user_id, p_amount_inr, p_upi_id, 'pending');

  -- 5. Insert Transaction Log
  INSERT INTO transactions (user_id, type, amount, source, status)
  VALUES (p_user_id, 'debit', p_coin_amount, 'withdrawal_request', 'success');

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Admin Status Update Function
DROP FUNCTION IF EXISTS update_withdrawal_status(UUID, TEXT, TEXT);
CREATE OR REPLACE FUNCTION update_withdrawal_status(
  p_withdrawal_id UUID,
  p_status TEXT, -- 'approved', 'rejected', 'paid'
  p_admin_notes TEXT
) RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_amount_inr INTEGER;
  v_coin_amount INTEGER;
BEGIN
  -- 1. Get withdrawal details
  SELECT user_id, amount INTO v_user_id, v_amount_inr FROM withdrawals WHERE id = p_withdrawal_id;
  v_coin_amount := v_amount_inr * 10;

  -- 2. Update status
  UPDATE withdrawals 
  SET status = p_status, 
      admin_notes = p_admin_notes,
      processed_at = CASE WHEN p_status IN ('paid', 'rejected') THEN NOW() ELSE processed_at END,
      updated_at = NOW()
  WHERE id = p_withdrawal_id;

  -- 3. Update Wallet based on status
  IF p_status = 'paid' THEN
    UPDATE user_wallets 
    SET pending_withdrawal = pending_withdrawal - v_coin_amount,
        withdrawn_amount = withdrawn_amount + v_coin_amount,
        last_updated = NOW()
    WHERE user_id = v_user_id;
  ELSIF p_status = 'rejected' THEN
    UPDATE user_wallets 
    SET pending_withdrawal = pending_withdrawal - v_coin_amount,
        available_balance = available_balance + v_coin_amount,
        last_updated = NOW()
    WHERE user_id = v_user_id;
    
    -- Log refund transaction
    INSERT INTO transactions (user_id, type, amount, source, status)
    VALUES (v_user_id, 'credit', v_coin_amount, 'withdrawal_rejection', 'success');
  END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Trigger and Initialization
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_profile_created_wallet') THEN
    CREATE TRIGGER on_profile_created_wallet
      AFTER INSERT ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();
  END IF;
END $$;

INSERT INTO user_wallets (user_id, available_balance, total_earned)
SELECT id, coins, coins FROM profiles
ON CONFLICT (user_id) DO NOTHING;
